import axios, { AxiosInstance } from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TellerService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = 'https://api.teller.io';

    const certPath = process.env.TELLER_CERT_PATH;
    const keyPath = process.env.TELLER_KEY_PATH;

    let httpsAgent;

    if (certPath && keyPath) {
      try {
        const cert = fs.readFileSync(path.resolve(process.cwd(), certPath));
        const key = fs.readFileSync(path.resolve(process.cwd(), keyPath));

        httpsAgent = new https.Agent({
          cert,
          key,
        });
        console.log('🔐 Teller mTLS configured successfully');
      } catch (error) {
        console.error('❌ Failed to load Teller certificates:', error);
      }
    }

    // We don't set default auth here because we need to use the access token for each request
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent,
    });
  }

  private getAuthHeader(accessToken: string) {
    // Use the passed enrollment access token for authentication
    // This token is specific to the enrollment and is provided by Teller Connect
    return {
      auth: {
        username: accessToken,
        password: '',
      },
    };
  }

  async getAccounts(accessToken: string) {
    try {
      console.log('🔑 Using Enrollment Token for auth:', accessToken.substring(0, 20) + '...');
      console.log('🔐 HTTPS Agent configured:', !!this.client.defaults.httpsAgent);
      const response = await this.client.get('/accounts', this.getAuthHeader(accessToken));
      return response.data;
    } catch (error: any) {
      console.error('Teller getAccounts error:', error.response?.data || error.message);
      throw new Error('Failed to fetch accounts from Teller');
    }
  }

  async getAccount(accessToken: string, accountId: string) {
    try {
      const response = await this.client.get(`/accounts/${accountId}`, this.getAuthHeader(accessToken));
      return response.data;
    } catch (error: any) {
      console.error('Teller getAccount error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBalances(accessToken: string, accountId: string) {
    try {
      const response = await this.client.get(`/accounts/${accountId}/balances`, this.getAuthHeader(accessToken));
      return response.data;
    } catch (error: any) {
      console.error('Teller getBalances error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTransactions(accessToken: string, accountId: string, params: any = {}) {
    try {
      const response = await this.client.get(`/accounts/${accountId}/transactions`, {
        ...this.getAuthHeader(accessToken),
        params: {
          count: params.count || 100,
          from_id: params.fromId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Teller getTransactions error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTransactionDetails(accessToken: string, accountId: string, transactionId: string) {
    try {
      const response = await this.client.get(
        `/accounts/${accountId}/transactions/${transactionId}`,
        this.getAuthHeader(accessToken)
      );
      return response.data;
    } catch (error: any) {
      console.error('Teller getTransactionDetails error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const tellerService = new TellerService();
