import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TellerService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.TELLER_ENVIRONMENT === 'production'
      ? 'https://api.teller.io'
      : 'https://sandbox.teller.io';

    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: process.env.TELLER_API_KEY!,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateConnectUrl(userId: string) {
    const enrollmentId = `user_${userId}_${Date.now()}`;
    
    return {
      connectUrl: `${this.baseURL}/connect?application_id=${process.env.TELLER_APP_ID}&enrollment_id=${enrollmentId}`,
      enrollmentId,
    };
  }

  async exchangeEnrollment(enrollmentId: string) {
    const response = await this.client.post('/token', {
      enrollment_id: enrollmentId,
    });
    return response.data.access_token;
  }

  async getAccounts(accessToken: string) {
    const response = await this.client.get('/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getAccountDetails(accessToken: string, accountId: string) {
    const response = await this.client.get(`/accounts/${accountId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getBalance(accessToken: string, accountId: string) {
    const response = await this.client.get(`/accounts/${accountId}/balances`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getTransactions(accessToken: string, accountId: string, count: number = 100) {
    const response = await this.client.get(`/accounts/${accountId}/transactions`, {
      params: { count },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async syncAccount(userId: string, accessToken: string, tellerAccountId: string) {
    try {
      const accountDetails = await this.getAccountDetails(accessToken, tellerAccountId);
      const balance = await this.getBalance(accessToken, tellerAccountId);

      const account = await prisma.bankAccount.upsert({
        where: { tellerAccountId },
        update: {
          available: parseFloat(balance.available) || 0,
          current: parseFloat(balance.ledger) || 0,
          limit: accountDetails.type === 'credit' ? parseFloat(accountDetails.limit || '0') : null,
          lastSyncedAt: new Date(),
          status: 'active',
        },
        create: {
          userId,
          tellerAccessToken: accessToken,
          tellerAccountId,
          institutionName: accountDetails.institution?.name || 'Unknown',
          accountName: accountDetails.name || 'Account',
          accountType: accountDetails.type || 'checking',
          accountNumber: accountDetails.last_four || null,
          available: parseFloat(balance.available) || 0,
          current: parseFloat(balance.ledger) || 0,
          limit: accountDetails.type === 'credit' ? parseFloat(accountDetails.limit || '0') : null,
        },
      });

      return account;
    } catch (error) {
      console.error('Teller sync error:', error);
      throw error;
    }
  }

  async syncTransactions(userId: string, dbAccountId: string, accessToken: string, tellerAccountId: string) {
    try {
      const transactions = await this.getTransactions(accessToken, tellerAccountId);
      
      const savedTransactions = [];

      for (const txn of transactions) {
        const saved = await prisma.transaction.upsert({
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
            bankAccountId: dbAccountId,
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

        savedTransactions.push(saved);
      }

      return savedTransactions;
    } catch (error) {
      console.error('Transaction sync error:', error);
      throw error;
    }
  }
}

export const tellerService = new TellerService();
