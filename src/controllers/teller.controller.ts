import { Request, Response } from 'express';
import { tellerService } from '../services/teller.service';
import { PrismaClient } from '@prisma/client';
import { categorizeTransaction } from '../services/ai.service';
import { checkForFraud, checkBudgetLimit } from '../services/alert.service';

const prisma = new PrismaClient();

export const getConnectUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { connectUrl, enrollmentId } = await tellerService.generateConnectUrl(userId);
    
    res.json({ connectUrl, enrollmentId });
  } catch (error) {
    console.error('Connect URL error:', error);
    res.status(500).json({ error: 'Failed to generate connect URL' });
  }
};

export const handleConnection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID required' });
    }

    const accessToken = await tellerService.exchangeEnrollment(enrollmentId);
    const accounts = await tellerService.getAccounts(accessToken);

    const syncedAccounts = [];
    for (const account of accounts) {
      const synced = await tellerService.syncAccount(userId, accessToken, account.id);
      syncedAccounts.push(synced);
    }

    res.json({
      message: 'Accounts connected successfully',
      accounts: syncedAccounts,
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect accounts' });
  }
};

export const syncAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accountId } = req.params;
    const io = (req as any).app.get('io');

    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account || !account.tellerAccessToken) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await tellerService.syncAccount(userId, account.tellerAccessToken, account.tellerAccountId);

    const transactions = await tellerService.syncTransactions(
      userId,
      accountId,
      account.tellerAccessToken,
      account.tellerAccountId
    );

    let categorizedCount = 0;

    for (const txn of transactions) {
      if (!txn.category) {
        const aiResult = await categorizeTransaction(txn.description, txn.amount);
        
        const updated = await prisma.transaction.update({
          where: { id: txn.id },
          data: {
            category: aiResult.category,
            subcategory: aiResult.subcategory,
            isRecurring: aiResult.isRecurring,
            isTaxDeductible: aiResult.isTaxDeductible,
            confidence: aiResult.confidence,
          },
        });

        io.to(userId).emit('new_transaction', {
          transaction: updated,
          category: aiResult,
        });

        await checkForFraud(updated, io);
        
        if (txn.type === 'debit' && aiResult.category) {
          await checkBudgetLimit(userId, aiResult.category, Math.abs(txn.amount), io);
        }

        categorizedCount++;
      }
    }

    res.json({
      message: 'Account synced successfully',
      transactionCount: transactions.length,
      categorizedCount,
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
        _count: {
          select: { transactions: true }
        }
      }
    });

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
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
