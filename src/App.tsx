import React, { useState, useEffect } from 'react';
import { 
  Role, 
  AdminTab, 
  MerchantTab, 
  Language, 
  Merchant, 
  Transaction, 
  MfsAccount, 
  Wallet as WalletType, 
  UsdtVerification, 
  FraudAlert, 
  AuditLog, 
  AndroidDevice 
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { SuperAdminView } from './components/SuperAdminView';
import { MerchantView } from './components/MerchantView';
import { MfsManagementModule } from './components/MfsManagementModule';
import { AndroidSmsParserModule } from './components/AndroidSmsParserModule';
import { FraudDetectionModule } from './components/FraudDetectionModule';
import { ApiDocsSandboxModule } from './components/ApiDocsSandboxModule';
import { HelpCenterModule } from './components/HelpCenterModule';
import { api } from './services/api';

export default function App() {
  // Theme & Language
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<Language>('en');

  // Role & Active Profiles
  const [role, setRole] = useState<Role>('super_admin');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Tab selections
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [activeMerchantTab, setActiveMerchantTab] = useState<MerchantTab>('overview');

  // App Data State (Initial Seed Data + Live Sync)
  const [merchants, setMerchants] = useState<Merchant[]>([
    {
      id: 'mch_apex_101',
      name: 'Apex Global Gaming',
      code: 'APEX',
      email: 'finance@apexgaming.io',
      status: 'active',
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
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
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
    },
    {
      id: 'TX-984209',
      txHash: '0x7e2b...41a9',
      merchantId: 'mch_nexus_102',
      merchantName: 'Nexus Commerce Ltd',
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
    }
  ]);

  const [mfsAccounts, setMfsAccounts] = useState<MfsAccount[]>([
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
  ]);

  const [wallets, setWallets] = useState<WalletType[]>([
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
      dailyLimit: 500000,
      usedToday: 42000,
      currentBalance: 458200,
      ownerName: 'BETSPAY Treasury',
      authDocumentRef: 'DOC-AUTH-USDT-9941',
    }
  ]);

  const [usdtVerifications, setUsdtVerifications] = useState<UsdtVerification[]>([
    {
      id: 'usdt_ver_501',
      merchantId: 'mch_nexus_102',
      merchantName: 'Nexus Commerce Ltd',
      requestedAmountUsdt: 500,
      network: 'TRC20',
      txHash: '7b83f1e9c2a4d5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    }
  ]);

  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
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
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_301',
      userId: 'admin_root',
      userName: 'Super Admin (@betspaycloudadmin)',
      role: 'Super Admin',
      action: 'SYSTEM_INITIALIZATION',
      target: 'BETSPAY GLOBAL Engine Operational',
      ipAddress: '103.245.19.82',
      timestamp: new Date().toISOString(),
    }
  ]);

  const [devices, setDevices] = useState<AndroidDevice[]>([
    {
      id: 'dev_01',
      deviceName: 'Samsung Galaxy A54 (MFS Gateway 01)',
      deviceModel: 'SM-A546B',
      phoneNumber: '+8801711987654',
      simSlot: 'SIM 1 (bKash & Nagad)',
      status: 'connected',
      batteryLevel: 94,
      lastSyncTime: new Date().toISOString(),
      parsedCount: 4820,
      appVersion: 'v2.4.0-release',
      androidVersion: 'Android 14 (API 34)',
    }
  ]);

  // Sync initial data from REST API backend
  useEffect(() => {
    async function loadData() {
      const [m, t, w, u, f, a, d] = await Promise.all([
        api.getMerchants(),
        api.getTransactions(),
        api.getWallets(),
        api.getUsdtVerifications(),
        api.getFraudAlerts(),
        api.getAuditLogs(),
        api.getAndroidDevices(),
      ]);
      if (m.length) setMerchants(m);
      if (t.length) setTransactions(t);
      if (w.length) setWallets(w);
      if (u.length) setUsdtVerifications(u);
      if (f.length) setFraudAlerts(f);
      if (a.length) setAuditLogs(a);
      if (d.length) setDevices(d);
    }
    loadData();
  }, []);

  // Sync html dark class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const handleAddMerchant = async (data: { name: string; email: string; plan: string; dailyLimit: number; commissionRate: number }) => {
    const created = await api.createMerchant(data);
    if (created) {
      setMerchants([created, ...merchants]);
    } else {
      // Local fallback
      const newM: Merchant = {
        id: `mch_${Date.now()}`,
        name: data.name,
        code: data.name.slice(0, 5).toUpperCase(),
        email: data.email,
        status: 'demo',
        plan: data.plan,
        dailyLimit: data.dailyLimit,
        monthlyLimit: data.dailyLimit * 30,
        commissionRate: data.commissionRate,
        totalDeposit: 0,
        totalWithdraw: 0,
        usdtActivationStatus: 'unsubmitted',
        apiKey: `bp_demo_${Math.random().toString(36).substring(2)}`,
        apiSecret: `secret_demo_${Math.random().toString(36).substring(2)}`,
        webhookUrl: '',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      setMerchants([newM, ...merchants]);
    }
  };

  const handleUpdateMerchantStatus = async (id: string, status: Merchant['status']) => {
    await api.updateMerchant(id, { status });
    setMerchants(merchants.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleApproveUsdt = async (id: string) => {
    const result = await api.approveUsdtVerification(id);
    setUsdtVerifications(usdtVerifications.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    if (result && result.merchant) {
      setMerchants(merchants.map(m => m.id === result.merchant.id ? result.merchant : m));
    } else {
      // Local fallback approve
      const ver = usdtVerifications.find(u => u.id === id);
      if (ver) {
        setMerchants(merchants.map(m => m.id === ver.merchantId ? { ...m, status: 'active', usdtActivationStatus: 'approved' } : m));
      }
    }
  };

  const handleSubmitUsdt = async (amount: number, txHash: string) => {
    if (!selectedMerchant) return;
    const created = await api.submitUsdtVerification({
      merchantId: selectedMerchant.id,
      requestedAmountUsdt: amount,
      network: 'TRC20',
      txHash,
    });
    if (created) {
      setUsdtVerifications([created, ...usdtVerifications]);
    }
    setMerchants(merchants.map(m => m.id === selectedMerchant.id ? { ...m, usdtActivationStatus: 'pending' } : m));
  };

  const handleCreateTx = async (data: { merchantId: string; provider: string; type: string; amount: number; accountNumber: string }) => {
    const created = await api.createTransaction(data);
    if (created) {
      setTransactions([created, ...transactions]);
    }
  };

  const handleAddWallet = async (data: Partial<WalletType>) => {
    const created = await api.addWallet(data);
    if (created) {
      setWallets([created, ...wallets]);
    }
  };

  const handleSimulateSms = async (smsBody: string) => {
    const res = await api.syncAndroidSms(smsBody);
    if (res && res.transactionCreated) {
      setTransactions([res.transactionCreated, ...transactions]);
    }
    return res;
  };

  const handleConnectDevice = async (data: { deviceName: string; deviceModel: string; phoneNumber: string; simSlot: string }) => {
    const created = await api.connectAndroidDevice(data);
    if (created) {
      setDevices([created, ...devices]);
    } else {
      const newDev: AndroidDevice = {
        id: `dev_${Date.now()}`,
        deviceName: data.deviceName,
        deviceModel: data.deviceModel,
        phoneNumber: data.phoneNumber,
        simSlot: data.simSlot,
        status: 'connected',
        batteryLevel: 98,
        lastSyncTime: new Date().toISOString(),
        parsedCount: 0,
        appVersion: 'v2.4.0-release',
        androidVersion: 'Android 14 (API 34)',
      };
      setDevices([newDev, ...devices]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        role={role}
        setRole={setRole}
        selectedMerchant={selectedMerchant}
        setSelectedMerchant={setSelectedMerchant}
        merchants={merchants}
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          role={role}
          activeAdminTab={activeAdminTab}
          setActiveAdminTab={setActiveAdminTab}
          activeMerchantTab={activeMerchantTab}
          setActiveMerchantTab={setActiveMerchantTab}
          pendingUsdtCount={usdtVerifications.filter(u => u.status === 'pending').length}
          openFraudCount={fraudAlerts.filter(f => f.status === 'open').length}
          lang={lang}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {role === 'super_admin' ? (
            <>
              {activeAdminTab === 'overview' && (
                <SuperAdminView
                  activeTab={activeAdminTab}
                  setActiveTab={setActiveAdminTab}
                  merchants={merchants}
                  transactions={transactions}
                  usdtVerifications={usdtVerifications}
                  fraudAlerts={fraudAlerts}
                  auditLogs={auditLogs}
                  onAddMerchant={handleAddMerchant}
                  onUpdateMerchantStatus={handleUpdateMerchantStatus}
                  onApproveUsdt={handleApproveUsdt}
                  lang={lang}
                />
              )}
              {activeAdminTab === 'merchants' && (
                <SuperAdminView
                  activeTab={activeAdminTab}
                  setActiveTab={setActiveAdminTab}
                  merchants={merchants}
                  transactions={transactions}
                  usdtVerifications={usdtVerifications}
                  fraudAlerts={fraudAlerts}
                  auditLogs={auditLogs}
                  onAddMerchant={handleAddMerchant}
                  onUpdateMerchantStatus={handleUpdateMerchantStatus}
                  onApproveUsdt={handleApproveUsdt}
                  lang={lang}
                />
              )}
              {activeAdminTab === 'transactions' && (
                <MerchantView
                  merchant={merchants[0]}
                  activeTab="transactions"
                  setActiveTab={() => {}}
                  transactions={transactions}
                  wallets={wallets}
                  onSubmitUsdt={handleSubmitUsdt}
                  onCreateTx={handleCreateTx}
                  onAddWallet={handleAddWallet}
                  lang={lang}
                />
              )}
              {activeAdminTab === 'mfs' && (
                <MfsManagementModule mfsAccounts={mfsAccounts} lang={lang} />
              )}
              {activeAdminTab === 'usdt_verifications' && (
                <SuperAdminView
                  activeTab={activeAdminTab}
                  setActiveTab={setActiveAdminTab}
                  merchants={merchants}
                  transactions={transactions}
                  usdtVerifications={usdtVerifications}
                  fraudAlerts={fraudAlerts}
                  auditLogs={auditLogs}
                  onAddMerchant={handleAddMerchant}
                  onUpdateMerchantStatus={handleUpdateMerchantStatus}
                  onApproveUsdt={handleApproveUsdt}
                  lang={lang}
                />
              )}
              {activeAdminTab === 'fraud' && (
                <FraudDetectionModule fraudAlerts={fraudAlerts} lang={lang} />
              )}
              {activeAdminTab === 'android_app' && (
                <AndroidSmsParserModule devices={devices} onSimulateSms={handleSimulateSms} onConnectDevice={handleConnectDevice} lang={lang} />
              )}
              {activeAdminTab === 'audit_logs' && (
                <SuperAdminView
                  activeTab={activeAdminTab}
                  setActiveTab={setActiveAdminTab}
                  merchants={merchants}
                  transactions={transactions}
                  usdtVerifications={usdtVerifications}
                  fraudAlerts={fraudAlerts}
                  auditLogs={auditLogs}
                  onAddMerchant={handleAddMerchant}
                  onUpdateMerchantStatus={handleUpdateMerchantStatus}
                  onApproveUsdt={handleApproveUsdt}
                  lang={lang}
                />
              )}
              {activeAdminTab === 'api_docs' && (
                <ApiDocsSandboxModule lang={lang} />
              )}
              {activeAdminTab === 'help_center' && (
                <HelpCenterModule lang={lang} />
              )}
            </>
          ) : (
            <MerchantView
              merchant={selectedMerchant || merchants[1]} // Default to Nexus Commerce (Demo)
              activeTab={activeMerchantTab}
              setActiveTab={setActiveMerchantTab}
              transactions={transactions}
              wallets={wallets}
              onSubmitUsdt={handleSubmitUsdt}
              onCreateTx={handleCreateTx}
              onAddWallet={handleAddWallet}
              lang={lang}
            />
          )}
        </main>

      </div>

      {/* Account / Role Preset Selector Modal */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        role={role}
        setRole={setRole}
        selectedMerchant={selectedMerchant}
        setSelectedMerchant={setSelectedMerchant}
        merchants={merchants}
        lang={lang}
      />

    </div>
  );
}
