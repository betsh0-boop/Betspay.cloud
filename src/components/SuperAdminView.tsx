import React, { useState } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  UserPlus, 
  QrCode, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Key, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  History,
  MoreVertical,
  Check,
  Zap,
  Building2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Merchant, Transaction, UsdtVerification, FraudAlert, AuditLog, AdminTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface SuperAdminViewProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  merchants: Merchant[];
  transactions: Transaction[];
  usdtVerifications: UsdtVerification[];
  fraudAlerts: FraudAlert[];
  auditLogs: AuditLog[];
  onAddMerchant: (data: { name: string; email: string; plan: string; dailyLimit: number; commissionRate: number }) => void;
  onUpdateMerchantStatus: (id: string, status: Merchant['status']) => void;
  onApproveUsdt: (id: string) => void;
  lang: Language;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  activeTab,
  setActiveTab,
  merchants,
  transactions,
  usdtVerifications,
  fraudAlerts,
  auditLogs,
  onAddMerchant,
  onUpdateMerchantStatus,
  onApproveUsdt,
  lang,
}) => {
  const t = translations[lang];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMerchantForKeys, setSelectedMerchantForKeys] = useState<Merchant | null>(null);

  // Form State
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantEmail, setNewMerchantEmail] = useState('');
  const [newMerchantPlan, setNewMerchantPlan] = useState('Standard Merchant');
  const [newMerchantLimit, setNewMerchantLimit] = useState(2000000);
  const [newMerchantCommission, setNewMerchantCommission] = useState(1.5);

  // Aggregated Stats
  const totalMerchants = merchants.length;
  const activeMerchants = merchants.filter(m => m.status === 'active').length;
  const pendingMerchants = merchants.filter(m => m.status === 'demo' || m.status === 'pending').length;
  const suspendedMerchants = merchants.filter(m => m.status === 'suspended').length;

  const totalDepositVolume = merchants.reduce((sum, m) => sum + m.totalDeposit, 0);
  const totalWithdrawVolume = merchants.reduce((sum, m) => sum + m.totalWithdraw, 0);
  const totalRevenue = Math.round(totalDepositVolume * 0.0135);
  const totalTxCount = transactions.length + 15480;
  const pendingUsdtCount = usdtVerifications.filter(v => v.status === 'pending').length;

  // Chart Data
  const volumeTrendData = [
    { day: 'Nov 01', payin: 12400000, payout: 8900000 },
    { day: 'Nov 02', payin: 14200000, payout: 10100000 },
    { day: 'Nov 03', payin: 18900000, payout: 12500000 },
    { day: 'Nov 04', payin: 21500000, payout: 15400000 },
    { day: 'Nov 05', payin: 19800000, payout: 14200000 },
    { day: 'Nov 06', payin: 24500000, payout: 18100000 },
    { day: 'Nov 07', payin: 28900000, payout: 21000000 },
  ];

  const providerSplitData = [
    { name: 'bKash', value: 45, color: '#EC4899' },
    { name: 'Nagad', value: 30, color: '#F97316' },
    { name: 'Rocket', value: 12, color: '#8B5CF6' },
    { name: 'Upay', value: 8, color: '#3B82F6' },
    { name: 'USDT', value: 5, color: '#10B981' },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName || !newMerchantEmail) return;
    onAddMerchant({
      name: newMerchantName,
      email: newMerchantEmail,
      plan: newMerchantPlan,
      dailyLimit: newMerchantLimit,
      commissionRate: newMerchantCommission,
    });
    setNewMerchantName('');
    setNewMerchantEmail('');
    setIsCreateModalOpen(false);
  };

  const filteredMerchants = merchants.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Super Admin Control Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              BETSPAY GLOBAL PLATFORM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor merchant transaction volumes, approve USDT activations, and oversee MFS channels.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.merchants.createBtn}</span>
        </button>
      </div>

      {/* 2. Key Platform Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.totalMerchants}</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums mt-2">
            {totalMerchants}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">{activeMerchants} Live</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">{pendingMerchants} Demo</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.totalDepositVolume}</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-white font-mono tabular-nums mt-2">
            Tk {(totalDepositVolume / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            +18.4% this month
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.totalWithdrawalVolume}</span>
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-extrabold text-white font-mono tabular-nums mt-2">
            Tk {(totalWithdrawVolume / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Payout Disbursements
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.totalRevenue}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-extrabold text-amber-400 font-mono tabular-nums mt-2">
            Tk {(totalRevenue / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            Platform Commission (1.35%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.totalTransactions}</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-extrabold text-white font-mono tabular-nums mt-2">
            {totalTxCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Processed Transactions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.stats.pendingPayments}</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-extrabold text-amber-400 font-mono tabular-nums mt-2">
            {pendingUsdtCount} Pending
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            USDT Deposit Activations
          </span>
        </div>

      </div>

      {/* 3. Interactive Financial Volume Chart & Provider Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Daily Financial Volume Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Transaction Volume Trend (BDT)</h3>
              <p className="text-xs text-slate-400">Pay-in (Deposits) vs Payout (Disbursements) 7-day view</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pay-in
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Payout
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPayin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`Tk ${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="payin" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPayin)" />
                <Area type="monotone" dataKey="payout" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorPayout)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Provider Split */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">MFS Provider Share</h3>
            <p className="text-xs text-slate-400 mb-4">Volume distribution across bKash, Nagad, Rocket, Upay & USDT</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {providerSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
            {providerSplitData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span>{p.name}: <strong className="text-white">{p.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Merchant Management System Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Merchant Accounts Directory</h2>
            <p className="text-xs text-slate-400">Manage merchant status, limits, commission rates, and API credentials.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.merchants.searchPlaceholder}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Live)</option>
              <option value="demo">Demo Mode</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Merchant Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3 text-right">Daily Limit</th>
                <th className="p-3 text-right">Total Deposit</th>
                <th className="p-3 text-right">Fee Rate</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMerchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-sans font-bold text-white text-sm">{m.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{m.code} · {m.email}</div>
                  </td>

                  <td className="p-3 font-sans">
                    {m.status === 'active' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Live Active
                      </span>
                    )}
                    {m.status === 'demo' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Demo Mode
                      </span>
                    )}
                    {m.status === 'suspended' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-sans text-slate-300 font-medium">
                    {m.plan}
                  </td>

                  <td className="p-3 text-right text-slate-200 font-bold">
                    Tk {m.dailyLimit.toLocaleString()}
                  </td>

                  <td className="p-3 text-right text-emerald-400 font-bold">
                    Tk {m.totalDeposit.toLocaleString()}
                  </td>

                  <td className="p-3 text-right text-amber-400 font-bold">
                    {m.commissionRate}%
                  </td>

                  <td className="p-3 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      {m.status === 'active' ? (
                        <button
                          onClick={() => onUpdateMerchantStatus(m.id, 'suspended')}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateMerchantStatus(m.id, 'active')}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Activate Live
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedMerchantForKeys(m)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View API Keys"
                      >
                        <Key className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. Pending USDT Deposit Verification Queue */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              USDT Deposit Account Activation Queue
            </h3>
            <p className="text-xs text-slate-400">Review merchant USDT activation claims to convert Demo accounts to Live Production status.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {pendingUsdtCount} Action Required
          </span>
        </div>

        <div className="space-y-2.5">
          {usdtVerifications.map((ver) => (
            <div key={ver.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div>
                <div className="flex items-center gap-2 font-sans font-bold text-white text-sm">
                  <span>{ver.merchantName}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">
                    {ver.network}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Requested: <strong className="text-amber-400 font-mono">${ver.requestedAmountUsdt} USDT</strong> · Submitted: {new Date(ver.timestamp).toLocaleString()}
                </div>
                <div className="text-slate-500 text-[10px] truncate max-w-md mt-0.5">
                  TxHash: {ver.txHash}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-sans">
                {ver.status === 'pending' ? (
                  <button
                    onClick={() => onApproveUsdt(ver.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve & Activate Live
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    ✓ Approved & Live
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. System Audit Logs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          System Audit Trail & Admin Activity Logs
        </h3>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[11px] min-w-[140px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-bold text-amber-400">{log.action}</span>
                <span className="text-slate-400 font-sans">{log.target}</span>
              </div>
              <span className="text-slate-500 text-[11px] hidden sm:block">
                IP: {log.ipAddress} · {log.userName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Merchant */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">{t.merchants.formTitle}</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.merchants.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                  placeholder="e.g. SilkRoad Gaming Ltd"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.merchants.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={newMerchantEmail}
                  onChange={(e) => setNewMerchantEmail(e.target.value)}
                  placeholder="e.g. finance@silkroad.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.merchants.limitLabel}</label>
                  <input
                    type="number"
                    value={newMerchantLimit}
                    onChange={(e) => setNewMerchantLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t.merchants.commissionLabel}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMerchantCommission}
                    onChange={(e) => setNewMerchantCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-400/90 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>{t.merchants.noticeAdminOnly}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                >
                  Create Merchant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View API Keys */}
      {selectedMerchantForKeys && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">API Credentials: {selectedMerchantForKeys.name}</h3>
              <button onClick={() => setSelectedMerchantForKeys(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-sans block mb-1">API Key (x-api-key)</label>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-amber-400 select-all font-bold">
                  {selectedMerchantForKeys.apiKey}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-sans block mb-1">Secret Key (HMAC Signing Secret)</label>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 select-all font-bold">
                  {selectedMerchantForKeys.apiSecret}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMerchantForKeys(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
