import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  TrendingUp, 
  Smartphone, 
  Wallet, 
  KeyRound, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  QrCode, 
  CheckCircle2, 
  Search, 
  Download, 
  Play, 
  Copy, 
  Check, 
  Lock, 
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  HelpCircle,
  FileSpreadsheet,
  Headphones
} from 'lucide-react';
import { Merchant, Transaction, Wallet as WalletType, MerchantTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface MerchantViewProps {
  merchant: Merchant;
  activeTab: MerchantTab;
  setActiveTab: (tab: MerchantTab) => void;
  transactions: Transaction[];
  wallets: WalletType[];
  onSubmitUsdt: (amount: number, txHash: string) => void;
  onCreateTx: (data: { merchantId: string; provider: string; type: string; amount: number; accountNumber: string }) => void;
  onAddWallet: (data: Partial<WalletType>) => void;
  lang: Language;
}

export const MerchantView: React.FC<MerchantViewProps> = ({
  merchant,
  activeTab,
  setActiveTab,
  transactions,
  wallets,
  onSubmitUsdt,
  onCreateTx,
  onAddWallet,
  lang,
}) => {
  const t = translations[lang];

  // States
  const [isUsdtModalOpen, setIsUsdtModalOpen] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState<number>(500);
  const [usdtTxHash, setUsdtTxHash] = useState<string>('');

  // Sim Tx state
  const [simProvider, setSimProvider] = useState<string>('bkash');
  const [simType, setSimType] = useState<string>('payin');
  const [simAmount, setSimAmount] = useState<number>(1000);
  const [simAccount, setSimAccount] = useState<string>('+8801799887766');

  // Filter state
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [txProviderFilter, setTxProviderFilter] = useState('all');

  // Copy Feedback state
  const [copiedKey, setCopiedKey] = useState(false);

  // Add Wallet Modal
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletProvider, setNewWalletProvider] = useState('bkash');
  const [newWalletAccount, setNewWalletAccount] = useState('');

  const isDemo = merchant.status === 'demo';

  const merchantTxs = transactions.filter(t => t.merchantId === merchant.id);
  const filteredTxs = merchantTxs.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(txSearch.toLowerCase()) ||
                          tx.providerRef.toLowerCase().includes(txSearch.toLowerCase()) ||
                          tx.accountNumber.includes(txSearch);
    const matchesStatus = txStatusFilter === 'all' || tx.status === txStatusFilter;
    const matchesProvider = txProviderFilter === 'all' || tx.provider === txProviderFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleUsdtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdtTxHash) return;
    onSubmitUsdt(usdtAmount, usdtTxHash);
    setUsdtTxHash('');
    setIsUsdtModalOpen(false);
  };

  const handleAddWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName || !newWalletAccount) return;
    onAddWallet({
      walletName: newWalletName,
      provider: newWalletProvider as any,
      accountNumber: newWalletAccount,
      accountType: 'Merchant Float Account',
      status: 'active',
      dailyLimit: 1000000,
      usedToday: 0,
      currentBalance: 350000,
      ownerName: merchant.name,
      authDocumentRef: `DOC-AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setNewWalletName('');
    setNewWalletAccount('');
    setIsAddWalletOpen(false);
  };

  const handleSimTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTx({
      merchantId: merchant.id,
      provider: simProvider,
      type: simType,
      amount: simAmount,
      accountNumber: simAccount,
    });
    alert(`Simulation Payment Triggered! Amount: Tk ${simAmount.toLocaleString()}`);
  };

  const exportCsv = () => {
    const headers = ['TxID,Type,Provider,Account,ProviderRef,Amount,Fee,Net,Status,Timestamp\n'];
    const rows = filteredTxs.map(t => 
      `${t.id},${t.type},${t.provider},${t.accountNumber},${t.providerRef},${t.amount},${t.fee},${t.netAmount},${t.status},${t.timestamp}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BETSPAY_Transactions_${merchant.code}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DEMO MODE Warning Banner */}
      {isDemo && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-300">{t.demoBanner.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  DEMO MODE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {t.demoBanner.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUsdtModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>{t.demoBanner.activateBtn}</span>
          </button>
        </div>
      )}

      {/* Verified Banner if Active */}
      {!isDemo && merchant.status === 'active' && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{t.demoBanner.verifiedNotice}</span>
          </div>
          <span className="text-slate-400 font-mono">Status: LIVE PRODUCTION</span>
        </div>
      )}

      {/* Merchant Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{merchant.name}</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Code: {merchant.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            API Key: {merchant.apiKey.slice(0, 16)}... · Commission Rate: {merchant.commissionRate}%
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block">Daily Limit</span>
            <span className="font-bold text-white">Tk {merchant.dailyLimit.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block">Total Deposited</span>
            <span className="font-bold text-emerald-400">Tk {merchant.totalDeposit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t.stats.totalDepositVolume}</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                Tk {merchant.totalDeposit.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Pay-in Cash Receipts</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t.stats.totalWithdrawalVolume}</span>
              <div className="text-lg font-bold text-blue-400 font-mono mt-1">
                Tk {merchant.totalWithdraw.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Payout Disbursements</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t.stats.dailyLimit}</span>
              <div className="text-lg font-bold text-white font-mono mt-1">
                Tk {merchant.dailyLimit.toLocaleString()}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">{t.stats.commissionRate}</span>
              <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                {merchant.commissionRate}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Platform Rate</span>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t.transactions.title}</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-blue-400 hover:underline"
              >
                View All Transactions →
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {merchantTxs.slice(0, 5).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded ${tx.type === 'payin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {tx.type === 'payin' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{tx.id}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{tx.provider.toUpperCase()} · Ref: {tx.providerRef}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold ${tx.type === 'payin' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {tx.type === 'payin' ? '+' : '-'}Tk {tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-sans">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: Transactions */}
      {activeTab === 'transactions' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">{t.transactions.title}</h2>
              <p className="text-xs text-slate-400">Detailed transaction ledger with provider reference codes and verification status.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.transactions.exportCsv}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search TxID, TrxID, Account No..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={txStatusFilter}
              onChange={(e) => setTxStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={txProviderFilter}
              onChange={(e) => setTxProviderFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
            >
              <option value="all">All Providers</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="upay">Upay</option>
              <option value="usdt">USDT</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">TxID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Payer Account</th>
                  <th className="p-3">Provider Ref</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Fee</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-white font-bold">{tx.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'payin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 uppercase font-sans font-semibold">{tx.provider}</td>
                    <td className="p-3 text-slate-400">{tx.accountNumber}</td>
                    <td className="p-3 text-amber-400 font-bold">{tx.providerRef}</td>
                    <td className="p-3 text-right text-white font-bold">Tk {tx.amount.toLocaleString()}</td>
                    <td className="p-3 text-right text-slate-400">Tk {tx.fee}</td>
                    <td className="p-3 text-center font-sans">
                      {tx.status === 'successful' && <span className="text-emerald-400 font-bold">✓ Success</span>}
                      {tx.status === 'pending' && <span className="text-amber-400 font-bold">⏱ Pending</span>}
                      {tx.status === 'failed' && <span className="text-rose-400 font-bold">✕ Failed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Deposits & Withdrawals Simulator */}
      {activeTab === 'deposits_withdrawals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-400" />
              Payment Request Simulator (Demo / Live API Test)
            </h3>
            <p className="text-xs text-slate-400">Simulate customer cash-in (deposit) or merchant disbursement (payout) to test gateway callbacks.</p>

            <form onSubmit={handleSimTxSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Transaction Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimType('payin')}
                    className={`py-2 rounded-lg font-bold transition-colors ${simType === 'payin' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    Pay-in (Cash Deposit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimType('payout')}
                    className={`py-2 rounded-lg font-bold transition-colors ${simType === 'payout' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    Payout (Cash-out)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">MFS Provider Channel</label>
                <select
                  value={simProvider}
                  onChange={(e) => setSimProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="bkash">bKash (Merchant / Agent)</option>
                  <option value="nagad">Nagad (Postal Banking)</option>
                  <option value="rocket">DBBL Rocket</option>
                  <option value="upay">UCB Upay</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Customer / Account Number</label>
                <input
                  type="text"
                  value={simAccount}
                  onChange={(e) => setSimAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Amount (BDT)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-sans shadow-md"
              >
                Execute Simulated Transaction
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white">Disbursement Policy & Limits</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Daily Cashout Reserve</span>
                <span className="text-white font-bold font-mono text-sm">Tk {merchant.dailyLimit.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Automatic Settlement Schedule</span>
                <span className="text-emerald-400 font-bold">T+0 Instant Reconciled Settlement</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All disbursements require 2FA authorization or API HMAC signed headers. Cashouts beyond daily limits are queued for manual Super Admin review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Wallet Management */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                Authorized Wallet Management (ওয়ালেট ম্যানেজমেন্ট)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage registered settlement wallets, float pools, and daily disbursement limits.
              </p>
            </div>

            <button
              onClick={() => setIsAddWalletOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Authorized Wallet (ওয়ালেট যুক্ত করুন)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((w) => (
              <div key={w.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{w.walletName}</h3>
                      <span className="text-[11px] text-slate-400 font-mono uppercase">{w.provider} · {w.accountType}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans block">Account / Address</span>
                  <div className="text-white font-bold truncate">{w.accountNumber}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Current Balance</span>
                    <span className="text-emerald-400 font-bold">Tk {w.currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Daily Limit</span>
                    <span className="text-white font-bold">Tk {w.dailyLimit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Owner: {w.ownerName}</span>
                  <span className="text-amber-400/90">{w.authDocumentRef}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Payment Methods */}
      {activeTab === 'payment_methods' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Supported Payment Methods & Provider Controls
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enable or disable specific MFS channels and configure per-channel fee rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'bKash Merchant/Agent', provider: 'bkash', rate: '1.2%', min: 'Tk 10', max: 'Tk 25,000', status: 'Enabled' },
              { name: 'Nagad Postal Banking', provider: 'nagad', rate: '1.5%', min: 'Tk 10', max: 'Tk 30,000', status: 'Enabled' },
              { name: 'DBBL Rocket MFS', provider: 'rocket', rate: '1.8%', min: 'Tk 20', max: 'Tk 50,000', status: 'Enabled' },
              { name: 'UCB Upay Wallet', provider: 'upay', rate: '1.4%', min: 'Tk 10', max: 'Tk 20,000', status: 'Enabled' },
            ].map((pm) => (
              <div key={pm.provider} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{pm.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">Channel Fee: {pm.rate}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800 text-slate-300">
                  <div>Min Amount: <strong className="text-white">{pm.min}</strong></div>
                  <div>Max Amount: <strong className="text-white">{pm.max}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: API Credentials & Sandbox */}
      {activeTab === 'api_integration' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              API Credentials & HMAC SHA-256 Keys
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-sans block">Merchant API Key (x-api-key)</span>
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span className="truncate">{merchant.apiKey}</span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(merchant.apiKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-sans block">HMAC Signing Secret</span>
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="truncate">{merchant.apiSecret}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(merchant.apiSecret)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 block font-sans">Webhook Notification Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  defaultValue={merchant.webhookUrl || 'https://mymerchant.cloud/api/webhooks/pay'}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500">
                  Save Webhook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: USDT Activation Request */}
      {isUsdtModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                USDT Deposit Account Activation
              </h3>
              <button onClick={() => setIsUsdtModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Deposit minimum <strong className="text-white font-mono">500 USDT</strong> via TRC20 to activate live payment processing & bank API routing for <strong className="text-amber-400">{merchant.name}</strong>.
            </p>

            {/* TRC20 Address Display Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-500 font-sans block">USDT TRC20 Official Deposit Wallet</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-400 select-all font-bold text-center break-all">
                TXY9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4
              </div>
            </div>

            <form onSubmit={handleUsdtSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Deposit Amount (USDT)</label>
                <input
                  type="number"
                  min={500}
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Blockchain Transaction Hash (TxID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7b83f1e9c2a4d5b..."
                  value={usdtTxHash}
                  onChange={(e) => setUsdtTxHash(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => setIsUsdtModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                >
                  Submit Deposit for Admin Approval
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Add Authorized Wallet */}
      {isAddWalletOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Add Authorized Wallet (ওয়ালেট এড করুন)
              </h3>
              <button onClick={() => setIsAddWalletOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Register a new authorized MFS float account or crypto wallet for merchant payouts & settlements.
            </p>

            <form onSubmit={handleAddWalletSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-sans">Wallet Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary bKash Agent Float"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">MFS / Crypto Provider</label>
                <select
                  value={newWalletProvider}
                  onChange={(e) => setNewWalletProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                >
                  <option value="bkash">bKash Merchant/Agent</option>
                  <option value="nagad">Nagad Postal</option>
                  <option value="rocket">DBBL Rocket</option>
                  <option value="upay">UCB Upay</option>
                  <option value="usdt">USDT TRC20 Treasury</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-sans">Account Number / Wallet Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +8801711987654 or TRC20 address"
                  value={newWalletAccount}
                  onChange={(e) => setNewWalletAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddWalletOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                >
                  + Add Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
