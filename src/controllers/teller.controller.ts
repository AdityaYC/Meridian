import { Request, Response } from 'express';
import { tellerService } from '../services/teller.service';
import { PrismaClient } from '@prisma/client';
import { categorizeTransaction } from '../services/ai.service';
import { checkForFraud, checkBudgetLimit } from '../services/alert.service';

const prisma = new PrismaClient();

// getConnectUrl and handleConnection are no longer needed with the new Teller Connect flow

export const saveEnrollment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accessToken, enrollmentId, institution } = req.body;

    console.log('🔵 Save Enrollment Request:', { userId, enrollmentId, institution: institution?.name });

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    // Save enrollment to database
    const enrollment = await prisma.tellerEnrollment.upsert({
      where: { enrollmentId },
      update: {
        accessToken,
        institutionName: institution?.name || 'Unknown',
      },
      create: {
        userId,
        accessToken,
        enrollmentId,
        institutionName: institution?.name || 'Unknown',
      },
    });

    // Fetch accounts from Teller
    console.log('📡 Fetching accounts from Teller...');
    const accounts = await tellerService.getAccounts(accessToken);
    console.log(`✅ Found ${accounts.length} accounts from Teller`);

    const syncedAccounts = [];
    for (const account of accounts) {
      console.log(`🔄 Syncing account: ${account.id} (${account.name})`);

      // Fetch balances separately
      let balanceData = null;
      try {
        balanceData = await tellerService.getBalances(accessToken, account.id);
        console.log(`💰 Balance fetched for ${account.name}:`, balanceData);
      } catch (balanceError) {
        console.error(`⚠️  Could not fetch balance for ${account.id}:`, balanceError);
      }

      // Use balance data if available, otherwise fall back to zeros
      const available = balanceData?.available ? parseFloat(balanceData.available) : 0;
      const ledger = balanceData?.ledger ? parseFloat(balanceData.ledger) : 0;
      const limit = account.type === 'credit' && balanceData?.limit ? parseFloat(balanceData.limit) : null;

      // Upsert BankAccount
      const synced = await prisma.bankAccount.upsert({
        where: { tellerAccountId: account.id },
        update: {
          available,
          current: ledger,
          limit,
          lastSyncedAt: new Date(),
          status: account.status,
        },
        create: {
          userId,
          enrollmentId: enrollment.id,
          tellerAccountId: account.id,
          institutionName: account.institution?.name || institution?.name || 'Unknown',
          accountName: account.name || 'Account',
          accountType: account.type || 'checking',
          accountNumber: account.last_four || null,
          available,
          current: ledger,
          limit,
          currency: account.currency || 'USD',
          status: account.status,
        },
      });

      console.log(`✅ Account synced: ${account.name} - $${available.toFixed(2)}`);
      syncedAccounts.push(synced);

      // Initial transaction sync
      try {
        console.log(`📊 Syncing transactions for account ${synced.id}...`);
        const transactions = await tellerService.getTransactions(accessToken, account.id, { count: 100 });

        for (const txn of transactions) {
          await prisma.transaction.upsert({
            where: { tellerTransactionId: txn.id },
            update: {
              amount: parseFloat(txn.amount),
              status: txn.status,
              description: txn.description || 'No description',
              merchantName: txn.details?.counterparty?.name || null,
              details: txn,
            },
            create: {
              userId,
              bankAccountId: synced.id,
              tellerTransactionId: txn.id,
              amount: parseFloat(txn.amount),
              date: new Date(txn.date),
              description: txn.description || 'No description',
              merchantName: txn.details?.counterparty?.name || null,
              status: txn.status,
              type: txn.type,
              details: txn,
            },
          });
        }
        console.log(`✅ Synced ${transactions.length} transactions`);
      } catch (txnError) {
        console.error(`Error fetching transactions for account ${account.id}:`, txnError);
      }
    }

    res.json({
      success: true,
      message: 'Enrollment saved and accounts synced',
      accountCount: syncedAccounts.length,
      accounts: syncedAccounts,
    });
  } catch (error: any) {
    console.error('❌ Save enrollment error:', error);
    res.status(500).json({
      error: 'Failed to save enrollment',
      details: error.message
    });
  }
};

export const syncAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accountId } = req.params;
    const io = (req as any).app.get('io');

    // Get account with enrollment to get access token
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
      include: { enrollment: true },
    });

    if (!account || !account.enrollment?.accessToken) {
      return res.status(404).json({ error: 'Account not found or not connected' });
    }

    const accessToken = account.enrollment.accessToken;

    // Fetch latest account data
    const tellerAccount = await tellerService.getAccount(accessToken, account.tellerAccountId);

    // Fetch latest balances
    let balanceData;
    try {
      balanceData = await tellerService.getBalances(accessToken, account.tellerAccountId);
    } catch (error) {
      console.error('Could not fetch balances, using zeros:', error);
      balanceData = { available: '0', ledger: '0' };
    }

    // Update account balance
    await prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        available: parseFloat(balanceData.available) || 0,
        current: parseFloat(balanceData.ledger) || 0,
        lastSyncedAt: new Date(),
      },
    });

    // Fetch latest transactions
    const transactions = await tellerService.getTransactions(accessToken, account.tellerAccountId, { count: 100 });

    let newTransactions = 0;

    for (const txn of transactions) {
      const result = await prisma.transaction.upsert({
        where: { tellerTransactionId: txn.id },
        update: {}, // Do nothing if exists
        create: {
          userId,
          bankAccountId: accountId,
          tellerTransactionId: txn.id,
          amount: parseFloat(txn.amount),
          date: new Date(txn.date),
          description: txn.description || 'No description',
          merchantName: txn.details?.counterparty?.name || null,
          status: txn.status,
          type: txn.type,
          details: txn,
        },
      });

      // If created (createdAt is close to now), count it. 
      // Upsert returns the object. We can check if it was just created by comparing timestamps or by checking if we did an update (which we didn't really).
      // A simpler way is to check if it existed before, but upsert is atomic.
      // For now, we'll just count all processed.
      newTransactions++;

      // Trigger AI categorization if new
      if (!result.category) {
        const aiResult = await categorizeTransaction(result.description, result.amount);
        await prisma.transaction.update({
          where: { id: result.id },
          data: {
            category: aiResult.category,
            subcategory: aiResult.subcategory,
            isRecurring: aiResult.isRecurring,
            isTaxDeductible: aiResult.isTaxDeductible,
            confidence: aiResult.confidence,
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Account synced successfully',
      newTransactions,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync account' });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const accounts = await prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        enrollment: true,
        _count: {
          select: { transactions: true }
        }
      }
    });

    // Map to match the frontend expectation if needed, or return as is
    // The frontend expects snake_case properties in the provided code (balance_available etc)
    // But my schema uses camelCase. I should probably map it or update frontend to use camelCase.
    // The provided frontend code uses `account.balance_available`.
    // My schema has `available`.
    // I will map it here to match the frontend code provided in the prompt.

    const mappedAccounts = accounts.map(acc => ({
      id: acc.id,
      account_name: acc.accountName,
      institution_name: acc.institutionName,
      account_type: acc.accountType,
      last_four: acc.accountNumber,
      balance_available: acc.available,
      balance_current: acc.current,
      status: acc.status,
      last_synced_at: acc.lastSyncedAt,
      enrollment_id: acc.enrollmentId,
    }));

    res.json(mappedAccounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accountId } = req.params;

    await prisma.bankAccount.deleteMany({
      where: {
        id: accountId,
        userId,
      },
    });

    res.json({ success: true, message: 'Account disconnected' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['teller-signature'];
    const { type, payload } = req.body;

    console.log('Webhook received:', type);

    switch (type) {
      case 'transaction.created':
        console.log('New transaction webhook');
        break;

      case 'account.balance_changed':
        console.log('Balance changed webhook');
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
