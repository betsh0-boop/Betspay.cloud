import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Database State with Realistic Seed Data
let merchants = [
  {
    id: 'mch_apex_101',
    name: 'Apex Global Gaming',
    code: 'APEX',
    email: 'finance@apexgaming.io',
    status: 'active', // active, pending, suspended, demo
    plan: 'Enterprise VIP',
    dailyLimit: 5000000,
    monthlyLimit: 150000000,
    commissionRate: 1.2,
    totalDeposit: 84290000,
    totalWithdraw: 61500000,
    usdtActivationStatus: 'approved',
    apiKey: 'bp_live_8f93a1c0d4e5f6a7b8c9d0',
    apiSecret: 'secret_live_7e6d5c4b3a2f1e0d9c8b',
    webhookUrl: 'https://apexgaming.io/api/payments/webhook',
    createdAt: '2025-01-15T08:30:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'mch_nexus_102',
    name: 'Nexus Commerce Ltd',
    code: 'NEXUS',
    email: 'admin@nexuscommerce.cloud',
    status: 'demo',
    plan: 'Standard Merchant',
    dailyLimit: 500000,
    monthlyLimit: 10000000,
    commissionRate: 1.5,
    totalDeposit: 3500000,
    totalWithdraw: 2100000,
    usdtActivationStatus: 'pending',
    apiKey: 'bp_demo_3a4b5c6d7e8f9a0b1c2d',
    apiSecret: 'secret_demo_9a8b7c6d5e4f3a2b1c',
    webhookUrl: 'https://nexuscommerce.cloud/webhooks/pay',
    createdAt: '2025-02-01T10:15:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'mch_vortex_103',
    name: 'Vortex Entertainment',
    code: 'VORTEX',
    email: 'compliance@vortextch.com',
    status: 'suspended',
    plan: 'Pro Merchant',
    dailyLimit: 2000000,
    monthlyLimit: 50000000,
    commissionRate: 1.8,
    totalDeposit: 14200000,
    totalWithdraw: 11000000,
    usdtActivationStatus: 'rejected',
    apiKey: 'bp_live_11223344556677889900',
    apiSecret: 'secret_live_009988776655443322',
    webhookUrl: 'https://vortextch.com/betspay/callback',
    createdAt: '2025-02-10T14:45:00Z',
    lastActive: '2025-02-28T18:20:00Z',
  },
  {
    id: 'mch_orient_104',
    name: 'Orient Silk Road Trading',
    code: 'ORIENT',
    email: 'pay@orient-silk.cn',
    status: 'active',
    plan: 'Enterprise VIP',
    dailyLimit: 10000000,
    monthlyLimit: 300000000,
    commissionRate: 1.0,
    totalDeposit: 195400000,
    totalWithdraw: 148900000,
    usdtActivationStatus: 'approved',
    apiKey: 'bp_live_998877665544332211',
    apiSecret: 'secret_live_112233445566778899',
    webhookUrl: 'https://orient-silk.cn/api/callback',
    createdAt: '2025-01-05T09:00:00Z',
    lastActive: new Date().toISOString(),
  }
];

let mfsAccounts = [
  {
    id: 'mfs_bkash_01',
    provider: 'bkash',
    accountName: 'BETSPAY bKash Merchant 01',
    accountNumber: '+8801711987654',
    type: 'merchant',
    dailyLimit: 5000000,
    usedToday: 1840000,
    balance: 3160000,
    status: 'active',
    inTxCount: 1420,
    outTxCount: 380,
    performanceScore: 99.4,
  },
  {
    id: 'mfs_nagad_02',
    provider: 'nagad',
    accountName: 'BETSPAY Nagad Agent 02',
    accountNumber: '+8801822334455',
    type: 'agent',
    dailyLimit: 4000000,
    usedToday: 2150000,
    balance: 1850000,
    status: 'active',
    inTxCount: 980,
    outTxCount: 510,
    performanceScore: 98.8,
  },
  {
    id: 'mfs_rocket_03',
    provider: 'rocket',
    accountName: 'BETSPAY Rocket Auth 03',
    accountNumber: '+8801933445566',
    type: 'merchant',
    dailyLimit: 3000000,
    usedToday: 620000,
    balance: 2380000,
    status: 'active',
    inTxCount: 410,
    outTxCount: 190,
    performanceScore: 97.9,
  },
  {
    id: 'mfs_upay_04',
    provider: 'upay',
    accountName: 'BETSPAY Upay Biz 04',
    accountNumber: '+8801644556677',
    type: 'merchant',
    dailyLimit: 2000000,
    usedToday: 410000,
    balance: 1590000,
    status: 'active',
    inTxCount: 290,
    outTxCount: 95,
    performanceScore: 99.1,
  }
];

let wallets = [
  {
    id: 'wal_01',
    walletName: 'Primary bKash Float Pool',
    provider: 'bkash',
    accountNumber: '+8801711987654',
    accountType: 'Merchant Account',
    status: 'active',
    dailyLimit: 5000000,
    usedToday: 1840000,
    currentBalance: 3160000,
    ownerName: 'BETSPAY GLOBAL LTD',
    authDocumentRef: 'DOC-AUTH-2025-8812',
  },
  {
    id: 'wal_02',
    walletName: 'USDT TRC20 Cold Settlement',
    provider: 'usdt',
    accountNumber: 'TXY9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
    accountType: 'Crypto Treasury',
    status: 'active',
    dailyLimit: 500000, // in USDT
    usedToday: 42000,
    currentBalance: 458200,
    ownerName: 'BETSPAY Treasury',
    authDocumentRef: 'DOC-AUTH-USDT-9941',
  },
  {
    id: 'wal_03',
    walletName: 'Nagad Disbursement Reserve',
    provider: 'nagad',
    accountNumber: '+8801822334455',
    accountType: 'Agent Cash-out',
    status: 'active',
    dailyLimit: 4000000,
    usedToday: 2150000,
    currentBalance: 1850000,
    ownerName: 'BETSPAY Operations',
    authDocumentRef: 'DOC-AUTH-NAGAD-0012',
  }
];

let transactions = [
  {
    id: 'TX-984210',
    txHash: '0x8f3a...91c2',
    merchantId: 'mch_apex_101',
    merchantName: 'Apex Global Gaming',
    type: 'payin',
    provider: 'bkash',
    accountNumber: '+8801799887766',
    providerRef: 'BKS98421098X',
    amount: 15000,
    currency: 'BDT',
    fee: 180,
    netAmount: 14820,
    status: 'successful',
    verificationStatus: 'verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    smsBody: 'You have received Tk 15,000.00 from 01799887766. Fee Tk 0.00. Balance Tk 3,160,000.00. TrxID BKS98421098X at 07/11/2026 10:35.',
  },
  {
    id: 'TX-984209',
    txHash: '0x7e2b...41a9',
    merchantId: 'mch_orient_104',
    merchantName: 'Orient Silk Road Trading',
    type: 'payin',
    provider: 'nagad',
    accountNumber: '+8801811223344',
    providerRef: 'NGD44391029Y',
    amount: 45000,
    currency: 'BDT',
    fee: 450,
    netAmount: 44550,
    status: 'successful',
    verificationStatus: 'verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    smsBody: 'Nagad: Amount: Tk 45,000.00 received from 01811223344. TxID: NGD44391029Y. Date: 07/11/2026.',
  },
  {
    id: 'TX-984208',
    txHash: '0x3c1d...89f4',
    merchantId: 'mch_nexus_102',
    merchantName: 'Nexus Commerce Ltd',
    type: 'payout',
    provider: 'bkash',
    accountNumber: '+8801955667788',
    providerRef: 'BKS77123901Z',
    amount: 5000,
    currency: 'BDT',
    fee: 75,
    netAmount: 4925,
    status: 'pending',
    verificationStatus: 'unverified',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    smsBody: 'Cash Out Tk 5,000.00 to 01955667788 successful. TrxID BKS77123901Z.',
  },
  {
    id: 'TX-984207',
    txHash: '0x9d4e...12b8',
    merchantId: 'mch_vortex_103',
    merchantName: 'Vortex Entertainment',
    type: 'payin',
    provider: 'rocket',
    accountNumber: '+8801677889900',
    providerRef: 'RKT00192847Z',
    amount: 120000,
    currency: 'BDT',
    fee: 2160,
    netAmount: 117840,
    status: 'failed',
    verificationStatus: 'flagged',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    smsBody: 'Rocket Payment Failed due to invalid pin or timeout.',
  },
  {
    id: 'TX-984206',
    txHash: '0x5a2f...33e1',
    merchantId: 'mch_apex_101',
    merchantName: 'Apex Global Gaming',
    type: 'payin',
    provider: 'usdt',
    accountNumber: 'TXY9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4',
    providerRef: 'USDT-TRC20-991204',
    amount: 1250, // 1250 USDT
    currency: 'USDT',
    fee: 10,
    netAmount: 1240,
    status: 'successful',
    verificationStatus: 'verified',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    smsBody: 'USDT Deposit Verified: 1250.00 USDT via TRC20.',
  }
];

let usdtVerifications = [
  {
    id: 'usdt_ver_501',
    merchantId: 'mch_nexus_102',
    merchantName: 'Nexus Commerce Ltd',
    requestedAmountUsdt: 500,
    network: 'TRC20',
    txHash: '7b83f1e9c2a4d5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    adminNote: 'Awaiting TRC20 block confirmation check.',
  },
  {
    id: 'usdt_ver_500',
    merchantId: 'mch_apex_101',
    merchantName: 'Apex Global Gaming',
    requestedAmountUsdt: 2000,
    network: 'TRC20',
    txHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    status: 'approved',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    adminNote: 'Confirmed on TRON Network block #6849201.',
  }
];

let fraudAlerts = [
  {
    id: 'alert_901',
    severity: 'high',
    type: 'Duplicate TxID Reuse Attempt',
    txId: 'TX-984207',
    merchantId: 'mch_vortex_103',
    merchantName: 'Vortex Entertainment',
    description: 'Same provider transaction reference RKT00192847Z submitted 3 times within 60 seconds.',
    status: 'open',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'alert_902',
    severity: 'medium',
    type: 'Unusual Hourly Deposit Volume Spike',
    txId: 'TX-984209',
    merchantId: 'mch_orient_104',
    merchantName: 'Orient Silk Road Trading',
    description: 'Hourly deposit volume exceeded 300% of historical average (+Tk 4,500,000 in 1h).',
    status: 'investigating',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  }
];

let auditLogs = [
  {
    id: 'log_301',
    userId: 'admin_root',
    userName: 'Super Admin (@betspaycloudadmin)',
    role: 'Super Admin',
    action: 'USDT_DEPOSIT_APPROVED',
    target: 'Merchant: Apex Global Gaming ($2000 USDT)',
    ipAddress: '103.245.19.82',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'log_302',
    userId: 'mch_apex_101',
    userName: 'Apex Global Gaming',
    role: 'Merchant',
    action: 'REGENERATE_API_KEYS',
    target: 'API Key bp_live_8f93...',
    ipAddress: '180.211.201.44',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  }
];

let androidDevices = [
  {
    id: 'dev_01',
    deviceName: 'Samsung Galaxy A54 (MFS Sim Gateway 01)',
    deviceModel: 'SM-A546B',
    phoneNumber: '+8801711987654',
    simSlot: 'SIM 1 (bKash & Nagad)',
    status: 'connected',
    batteryLevel: 94,
    lastSyncTime: new Date().toISOString(),
    parsedCount: 4820,
    appVersion: 'v2.4.0-release',
    androidVersion: 'Android 14 (API 34)',
  },
  {
    id: 'dev_02',
    deviceName: 'Xiaomi Redmi Note 13 (MFS Gateway 02)',
    deviceModel: '2312DRA50G',
    phoneNumber: '+8801933445566',
    simSlot: 'SIM 2 (Rocket & Upay)',
    status: 'connected',
    batteryLevel: 88,
    lastSyncTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    parsedCount: 2915,
    appVersion: 'v2.4.0-release',
    androidVersion: 'Android 13 (API 33)',
  }
];

// --- REST API ROUTES ---

// 1. Health check & Stats
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'BETSPAY GLOBAL',
    domain: 'betpay.cloud',
    support: '@betspaycloudadmin',
    timestamp: new Date().toISOString(),
    mode: 'production-ready demo engine',
  });
});

app.get('/api/v1/stats', (req: Request, res: Response) => {
  const totalMerchants = merchants.length;
  const activeMerchants = merchants.filter(m => m.status === 'active').length;
  const pendingMerchants = merchants.filter(m => m.status === 'pending' || m.status === 'demo').length;
  const suspendedMerchants = merchants.filter(m => m.status === 'suspended').length;
  
  const totalDepositVolume = merchants.reduce((sum, m) => sum + m.totalDeposit, 0);
  const totalWithdrawVolume = merchants.reduce((sum, m) => sum + m.totalWithdraw, 0);
  const totalRevenue = Math.round(totalDepositVolume * 0.014); // 1.4% avg commission
  const totalTransactions = transactions.length + 15480; // offset for demo scale
  const pendingPayments = usdtVerifications.filter(v => v.status === 'pending').length;

  res.json({
    totalMerchants,
    activeMerchants,
    pendingMerchants,
    suspendedMerchants,
    totalDepositVolume,
    totalWithdrawVolume,
    totalRevenue,
    totalTransactions,
    pendingPayments,
    currency: 'BDT',
  });
});

// 2. Merchants API
app.get('/api/v1/merchants', (req: Request, res: Response) => {
  res.json(merchants);
});

app.post('/api/v1/merchants', (req: Request, res: Response) => {
  const { name, email, plan, dailyLimit, commissionRate } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const code = name.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase() || 'MCH';
  const newMerchant = {
    id: `mch_${code.toLowerCase()}_${Date.now().toString().slice(-4)}`,
    name,
    code,
    email,
    status: 'demo', // Always starts in Demo Mode until USDT verified
    plan: plan || 'Standard Merchant',
    dailyLimit: Number(dailyLimit) || 1000000,
    monthlyLimit: (Number(dailyLimit) || 1000000) * 30,
    commissionRate: Number(commissionRate) || 1.5,
    totalDeposit: 0,
    totalWithdraw: 0,
    usdtActivationStatus: 'unsubmitted',
    apiKey: `bp_demo_${crypto.randomBytes(10).toString('hex')}`,
    apiSecret: `secret_demo_${crypto.randomBytes(12).toString('hex')}`,
    webhookUrl: '',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  merchants.unshift(newMerchant);

  // Add audit log
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'admin_root',
    userName: 'Super Admin',
    role: 'Super Admin',
    action: 'CREATE_MERCHANT',
    target: `Merchant: ${name} (${code})`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newMerchant);
});

app.put('/api/v1/merchants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const merchantIndex = merchants.findIndex(m => m.id === id);
  if (merchantIndex === -1) {
    return res.status(404).json({ error: 'Merchant not found' });
  }

  merchants[merchantIndex] = { ...merchants[merchantIndex], ...req.body, lastActive: new Date().toISOString() };
  
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'admin_root',
    userName: 'Super Admin',
    role: 'Super Admin',
    action: 'UPDATE_MERCHANT',
    target: `Merchant ID: ${id}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
  });

  res.json(merchants[merchantIndex]);
});

app.post('/api/v1/merchants/:id/reset-password', (req: Request, res: Response) => {
  const { id } = req.params;
  const tempPassword = `BP#${crypto.randomBytes(4).toString('hex').toUpperCase()}!`;
  
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'admin_root',
    userName: 'Super Admin',
    role: 'Super Admin',
    action: 'RESET_MERCHANT_PASSWORD',
    target: `Merchant ID: ${id}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Password reset successfully', tempPassword });
});

// 3. Transactions API
app.get('/api/v1/transactions', (req: Request, res: Response) => {
  const { merchantId, status, provider, type, search } = req.query;
  let filtered = [...transactions];

  if (merchantId) {
    filtered = filtered.filter(t => t.merchantId === merchantId);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }
  if (provider && provider !== 'all') {
    filtered = filtered.filter(t => t.provider === provider);
  }
  if (type && type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(t => 
      t.id.toLowerCase().includes(q) ||
      t.providerRef.toLowerCase().includes(q) ||
      t.merchantName.toLowerCase().includes(q) ||
      t.accountNumber.includes(q)
    );
  }

  res.json(filtered);
});

app.post('/api/v1/transactions', (req: Request, res: Response) => {
  const { merchantId, provider, type, amount, accountNumber } = req.body;
  const merchant = merchants.find(m => m.id === merchantId) || merchants[0];
  
  const numAmount = Number(amount) || 1000;
  const fee = Math.round(numAmount * (merchant.commissionRate / 100));
  const refCode = `${provider.slice(0, 3).toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newTx = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    txHash: `0x${crypto.randomBytes(4).toString('hex')}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    type: type || 'payin',
    provider: provider || 'bkash',
    accountNumber: accountNumber || '+8801700001122',
    providerRef: refCode,
    amount: numAmount,
    currency: 'BDT',
    fee: fee,
    netAmount: type === 'payin' ? numAmount - fee : numAmount + fee,
    status: 'successful',
    verificationStatus: 'verified',
    timestamp: new Date().toISOString(),
    smsBody: `${provider.toUpperCase()}: Payment of Tk ${numAmount.toLocaleString()} processed. Ref ${refCode}.`,
  };

  transactions.unshift(newTx);
  merchant.totalDeposit += type === 'payin' ? numAmount : 0;
  merchant.totalWithdraw += type === 'payout' ? numAmount : 0;

  res.status(201).json(newTx);
});

// 4. MFS Accounts & Wallets
app.get('/api/v1/mfs-accounts', (req: Request, res: Response) => {
  res.json(mfsAccounts);
});

app.get('/api/v1/wallets', (req: Request, res: Response) => {
  res.json(wallets);
});

app.post('/api/v1/wallets', (req: Request, res: Response) => {
  const { walletName, provider, accountNumber, accountType, dailyLimit } = req.body;
  const newWallet = {
    id: `wal_${Date.now().toString().slice(-4)}`,
    walletName,
    provider,
    accountNumber,
    accountType: accountType || 'Merchant Account',
    status: 'active',
    dailyLimit: Number(dailyLimit) || 1000000,
    usedToday: 0,
    currentBalance: 500000,
    ownerName: 'BETSPAY GLOBAL LTD',
    authDocumentRef: `DOC-AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  wallets.unshift(newWallet);
  res.status(201).json(newWallet);
});

// 5. USDT Verification & Activation
app.get('/api/v1/usdt-verifications', (req: Request, res: Response) => {
  res.json(usdtVerifications);
});

app.post('/api/v1/usdt-verifications', (req: Request, res: Response) => {
  const { merchantId, requestedAmountUsdt, network, txHash } = req.body;
  const merchant = merchants.find(m => m.id === merchantId);

  const newVer = {
    id: `usdt_ver_${Date.now().toString().slice(-4)}`,
    merchantId,
    merchantName: merchant ? merchant.name : 'Unknown Merchant',
    requestedAmountUsdt: Number(requestedAmountUsdt) || 500,
    network: network || 'TRC20',
    txHash: txHash || `0x${crypto.randomBytes(32).toString('hex')}`,
    status: 'pending',
    timestamp: new Date().toISOString(),
    adminNote: 'Submitted for Super Admin verification.',
  };

  usdtVerifications.unshift(newVer);
  if (merchant) {
    merchant.usdtActivationStatus = 'pending';
  }

  res.status(201).json(newVer);
});

app.post('/api/v1/usdt-verifications/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const ver = usdtVerifications.find(v => v.id === id);
  if (!ver) {
    return res.status(404).json({ error: 'Verification request not found' });
  }

  ver.status = 'approved';
  ver.adminNote = 'Approved by Super Admin. Live account activated!';

  const merchant = merchants.find(m => m.id === ver.merchantId);
  if (merchant) {
    merchant.status = 'active';
    merchant.usdtActivationStatus = 'approved';
    merchant.apiKey = merchant.apiKey.replace('bp_demo_', 'bp_live_');
    merchant.apiSecret = merchant.apiSecret.replace('secret_demo_', 'secret_live_');
  }

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'admin_root',
    userName: 'Super Admin',
    role: 'Super Admin',
    action: 'APPROVE_USDT_ACTIVATION',
    target: `Merchant: ${ver.merchantName} ($${ver.requestedAmountUsdt} USDT)`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString(),
  });

  res.json({ message: 'Merchant account activated to Live status', verification: ver, merchant });
});

// 6. Fraud Alerts & Audit Logs
app.get('/api/v1/fraud-alerts', (req: Request, res: Response) => {
  res.json(fraudAlerts);
});

app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

app.get('/api/v1/android-devices', (req: Request, res: Response) => {
  res.json(androidDevices);
});

app.post('/api/v1/android-devices', (req: Request, res: Response) => {
  const { deviceName, deviceModel, phoneNumber, simSlot } = req.body;
  const newDevice = {
    id: `dev_${Date.now().toString().slice(-4)}`,
    deviceName: deviceName || 'Agent SIM Gateway Device',
    deviceModel: deviceModel || 'Android SIM Gateway',
    phoneNumber: phoneNumber || '+8801700000000',
    simSlot: simSlot || 'SIM 1 (Agent SIM)',
    status: 'connected',
    batteryLevel: 98,
    lastSyncTime: new Date().toISOString(),
    parsedCount: 0,
    appVersion: 'v2.4.0-release',
    androidVersion: 'Android 14 (API 34)',
  };
  androidDevices.unshift(newDevice);
  res.status(201).json(newDevice);
});

// 7. Android SMS Parser Receiver Endpoint
app.post('/api/v1/android/sms-sync', (req: Request, res: Response) => {
  const { deviceId, smsBody, sender, timestamp } = req.body;
  if (!smsBody) {
    return res.status(400).json({ error: 'SMS body is required' });
  }

  // Parse SMS text with RegEx for MFS providers
  let provider = 'unknown';
  let amount = 0;
  let providerRef = '';
  let type = 'payin';

  const bodyLower = smsBody.toLowerCase();

  // bKash Regex
  if (bodyLower.includes('bkash') || bodyLower.includes('trxid bks')) {
    provider = 'bkash';
    const amountMatch = smsBody.match(/(?:Tk|BDT|amount)\s*([\d,]+\.?\d*)/i);
    const refMatch = smsBody.match(/(?:TrxID|TxID|Ref)\s*([A-Z0-9]+)/i);
    if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (refMatch) providerRef = refMatch[1];
    if (bodyLower.includes('cash out') || bodyLower.includes('sent')) type = 'payout';
  } 
  // Nagad Regex
  else if (bodyLower.includes('nagad') || bodyLower.includes('ngd')) {
    provider = 'nagad';
    const amountMatch = smsBody.match(/(?:Tk|BDT|Amount:)\s*([\d,]+\.?\d*)/i);
    const refMatch = smsBody.match(/(?:TxID|TrxID):\s*([A-Z0-9]+)/i);
    if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (refMatch) providerRef = refMatch[1];
  }
  // Rocket Regex
  else if (bodyLower.includes('rocket') || bodyLower.includes('rkt')) {
    provider = 'rocket';
    const amountMatch = smsBody.match(/(?:Tk|BDT)\s*([\d,]+\.?\d*)/i);
    const refMatch = smsBody.match(/(?:TxID|TrxID)\s*([A-Z0-9]+)/i);
    if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (refMatch) providerRef = refMatch[1];
  }
  // Upay Regex
  else if (bodyLower.includes('upay')) {
    provider = 'upay';
    const amountMatch = smsBody.match(/(?:Tk|BDT)\s*([\d,]+\.?\d*)/i);
    const refMatch = smsBody.match(/(?:TxID|TrxID)\s*([A-Z0-9]+)/i);
    if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (refMatch) providerRef = refMatch[1];
  }

  // Create synced transaction record if parsed successfully
  let createdTx = null;
  if (provider !== 'unknown' && amount > 0) {
    createdTx = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      txHash: `0x${crypto.randomBytes(4).toString('hex')}`,
      merchantId: 'mch_apex_101',
      merchantName: 'Apex Global Gaming (Android Sync)',
      type,
      provider,
      accountNumber: sender || '+8801711987654',
      providerRef: providerRef || `SMS${Date.now().toString().slice(-6)}`,
      amount,
      currency: 'BDT',
      fee: Math.round(amount * 0.012),
      netAmount: amount - Math.round(amount * 0.012),
      status: 'successful',
      verificationStatus: 'verified',
      timestamp: new Date().toISOString(),
      smsBody,
    };
    transactions.unshift(createdTx);
  }

  res.json({
    success: true,
    parsed: {
      provider,
      amount,
      providerRef,
      type,
    },
    transactionCreated: createdTx,
    message: provider !== 'unknown' ? 'SMS parsed & transaction auto-reconciled successfully' : 'SMS received (no financial pattern matched)',
  });
});


// 8. ZIP Source Code Download Endpoint
app.get('/api/v1/download-source', (req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'betspay-global-full-project.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'betspay-global-full-project.zip');
  } else {
    res.status(404).json({ error: 'ZIP archive file not found' });
  }
});

app.get('/api/v1/download-source-base64', (req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'betspay-global-full-project.zip');
  if (fs.existsSync(zipPath)) {
    const fileBuffer = fs.readFileSync(zipPath);
    const base64Data = fileBuffer.toString('base64');
    res.json({
      filename: 'betspay-global-full-project.zip',
      mimeType: 'application/zip',
      base64: base64Data,
    });
  } else {
    res.status(404).json({ error: 'ZIP file not found' });
  }
});

// Start server & mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="en" class="dark">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>BETSPAY GLOBAL — Enterprise Payment Gateway</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            </head>
            <body class="bg-slate-950 text-slate-100 antialiased min-h-screen">
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BETSPAY GLOBAL] Server running on http://localhost:${PORT}`);
  });
}

startServer();
