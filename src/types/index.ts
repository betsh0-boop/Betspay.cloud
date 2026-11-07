export type Role = 'super_admin' | 'merchant';
export type Language = 'en' | 'zh';

export type MerchantStatus = 'active' | 'demo' | 'pending' | 'suspended';
export type UsdtStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';

export interface Merchant {
  id: string;
  name: string;
  code: string;
  email: string;
  status: MerchantStatus;
  plan: string;
  dailyLimit: number;
  monthlyLimit: number;
  commissionRate: number;
  totalDeposit: number;
  totalWithdraw: number;
  usdtActivationStatus: UsdtStatus;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  createdAt: string;
  lastActive: string;
}

export type TxType = 'payin' | 'payout';
export type Provider = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'usdt';
export type TxStatus = 'successful' | 'pending' | 'failed' | 'reversed';
export type VerificationStatus = 'verified' | 'unverified' | 'flagged';

export interface Transaction {
  id: string;
  txHash: string;
  merchantId: string;
  merchantName: string;
  type: TxType;
  provider: Provider;
  accountNumber: string;
  providerRef: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  status: TxStatus;
  verificationStatus: VerificationStatus;
  timestamp: string;
  smsBody?: string;
}

export interface MfsAccount {
  id: string;
  provider: Provider;
  accountName: string;
  accountNumber: string;
  type: 'merchant' | 'agent' | 'personal';
  dailyLimit: number;
  usedToday: number;
  balance: number;
  status: 'active' | 'warning' | 'maintenance' | 'disabled';
  inTxCount: number;
  outTxCount: number;
  performanceScore: number;
}

export interface Wallet {
  id: string;
  walletName: string;
  provider: Provider;
  accountNumber: string;
  accountType: string;
  status: 'active' | 'inactive';
  dailyLimit: number;
  usedToday: number;
  currentBalance: number;
  ownerName: string;
  authDocumentRef: string;
}

export interface UsdtVerification {
  id: string;
  merchantId: string;
  merchantName: string;
  requestedAmountUsdt: number;
  network: 'TRC20' | 'ERC20';
  txHash: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  adminNote?: string;
}

export interface FraudAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  txId: string;
  merchantId: string;
  merchantName: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  target: string;
  ipAddress: string;
  timestamp: string;
}

export interface AndroidDevice {
  id: string;
  deviceName: string;
  deviceModel: string;
  phoneNumber: string;
  simSlot: string;
  status: 'connected' | 'disconnected' | 'syncing';
  batteryLevel: number;
  lastSyncTime: string;
  parsedCount: number;
  appVersion: string;
  androidVersion: string;
}

export type AdminTab = 
  | 'overview' 
  | 'merchants' 
  | 'transactions' 
  | 'mfs' 
  | 'usdt_verifications' 
  | 'fraud' 
  | 'android_app' 
  | 'audit_logs' 
  | 'api_docs' 
  | 'help_center';

export type MerchantTab = 
  | 'overview' 
  | 'transactions' 
  | 'deposits_withdrawals' 
  | 'payment_methods' 
  | 'wallets' 
  | 'api_integration' 
  | 'reports' 
  | 'docs' 
  | 'settings' 
  | 'support';
