import { Merchant, Transaction, MfsAccount, Wallet, UsdtVerification, FraudAlert, AuditLog, AndroidDevice } from '../types';

export const api = {
  // Stats
  async getStats() {
    try {
      const res = await fetch('/api/v1/stats');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using local calculation:', e);
    }
    return null;
  },

  // Merchants
  async getMerchants(): Promise<Merchant[]> {
    try {
      const res = await fetch('/api/v1/merchants');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getMerchants:', e);
    }
    return [];
  },

  async createMerchant(data: { name: string; email: string; plan: string; dailyLimit: number; commissionRate: number }): Promise<Merchant | null> {
    try {
      const res = await fetch('/api/v1/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error createMerchant:', e);
    }
    return null;
  },

  async updateMerchant(id: string, data: Partial<Merchant>): Promise<Merchant | null> {
    try {
      const res = await fetch(`/api/v1/merchants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error updateMerchant:', e);
    }
    return null;
  },

  async resetPassword(id: string): Promise<{ tempPassword?: string } | null> {
    try {
      const res = await fetch(`/api/v1/merchants/${id}/reset-password`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error resetPassword:', e);
    }
    return null;
  },

  // Transactions
  async getTransactions(params?: { merchantId?: string; status?: string; provider?: string; type?: string; search?: string }): Promise<Transaction[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/v1/transactions?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getTransactions:', e);
    }
    return [];
  },

  async createTransaction(data: { merchantId: string; provider: string; type: string; amount: number; accountNumber: string }): Promise<Transaction | null> {
    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error createTransaction:', e);
    }
    return null;
  },

  // MFS Accounts & Wallets
  async getMfsAccounts(): Promise<MfsAccount[]> {
    try {
      const res = await fetch('/api/v1/mfs-accounts');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getMfsAccounts:', e);
    }
    return [];
  },

  async getWallets(): Promise<Wallet[]> {
    try {
      const res = await fetch('/api/v1/wallets');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getWallets:', e);
    }
    return [];
  },

  async addWallet(data: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const res = await fetch('/api/v1/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error addWallet:', e);
    }
    return null;
  },

  // USDT Verifications
  async getUsdtVerifications(): Promise<UsdtVerification[]> {
    try {
      const res = await fetch('/api/v1/usdt-verifications');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getUsdtVerifications:', e);
    }
    return [];
  },

  async submitUsdtVerification(data: { merchantId: string; requestedAmountUsdt: number; network: string; txHash: string }): Promise<UsdtVerification | null> {
    try {
      const res = await fetch('/api/v1/usdt-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error submitUsdtVerification:', e);
    }
    return null;
  },

  async approveUsdtVerification(id: string): Promise<any> {
    try {
      const res = await fetch(`/api/v1/usdt-verifications/${id}/approve`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error approveUsdtVerification:', e);
    }
    return null;
  },

  // Fraud & Audit
  async getFraudAlerts(): Promise<FraudAlert[]> {
    try {
      const res = await fetch('/api/v1/fraud-alerts');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getFraudAlerts:', e);
    }
    return [];
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/v1/audit-logs');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getAuditLogs:', e);
    }
    return [];
  },

  async getAndroidDevices(): Promise<AndroidDevice[]> {
    try {
      const res = await fetch('/api/v1/android-devices');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API error getAndroidDevices:', e);
    }
    return [];
  },

  async connectAndroidDevice(data: { deviceName: string; deviceModel: string; phoneNumber: string; simSlot: string }): Promise<AndroidDevice | null> {
    try {
      const res = await fetch('/api/v1/android-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error connectAndroidDevice:', e);
    }
    return null;
  },

  // Android SMS Sync Simulator Endpoint
  async syncAndroidSms(smsBody: string, sender: string = '+8801711987654') {
    try {
      const res = await fetch('/api/v1/android/sms-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsBody, sender, deviceId: 'dev_01', timestamp: new Date().toISOString() }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API error syncAndroidSms:', e);
    }
    return null;
  }
};
