import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  Smartphone, 
  Wallet, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  BarChart3, 
  KeyRound, 
  History,
  QrCode,
  Headphones
} from 'lucide-react';
import { Role, AdminTab, MerchantTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  role: Role;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeMerchantTab: MerchantTab;
  setActiveMerchantTab: (tab: MerchantTab) => void;
  pendingUsdtCount: number;
  openFraudCount: number;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeAdminTab,
  setActiveAdminTab,
  activeMerchantTab,
  setActiveMerchantTab,
  pendingUsdtCount,
  openFraudCount,
  lang,
}) => {
  const t = translations[lang];

  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'overview', label: t.nav.overview, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'merchants', label: t.nav.merchants, icon: <Users className="w-4 h-4" /> },
    { id: 'transactions', label: t.nav.transactions, icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'mfs', label: t.nav.mfs, icon: <Smartphone className="w-4 h-4" /> },
    { 
      id: 'usdt_verifications', 
      label: t.nav.usdtActivation, 
      icon: <QrCode className="w-4 h-4" />,
      badge: pendingUsdtCount > 0 ? pendingUsdtCount : undefined
    },
    { 
      id: 'fraud', 
      label: t.nav.fraud, 
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: openFraudCount > 0 ? openFraudCount : undefined
    },
    { id: 'android_app', label: t.nav.androidApp, icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
    { id: 'audit_logs', label: t.nav.auditLogs, icon: <History className="w-4 h-4" /> },
    { id: 'api_docs', label: t.nav.apiDocs, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'help_center', label: t.nav.helpCenter, icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const merchantNavItems: { id: MerchantTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t.nav.overview, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: t.nav.transactions, icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'deposits_withdrawals', label: t.nav.depositsWithdrawals, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'payment_methods', label: t.nav.paymentMethods, icon: <Smartphone className="w-4 h-4" /> },
    { id: 'wallets', label: t.nav.wallets, icon: <Wallet className="w-4 h-4" /> },
    { id: 'api_integration', label: t.nav.apiIntegration, icon: <KeyRound className="w-4 h-4" /> },
    { id: 'reports', label: t.nav.reports, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'docs', label: t.nav.apiDocs, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
    { id: 'support', label: t.nav.support, icon: <Headphones className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Role Title Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
            Navigation Mode
          </span>
          <span className="text-sm font-semibold text-white">
            {role === 'super_admin' ? 'Super Admin Console' : 'Merchant Dashboard'}
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {role === 'super_admin'
          ? adminNavItems.map((item) => {
              const active = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={active ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          : merchantNavItems.map((item) => {
              const active = activeMerchantTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMerchantTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={active ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
      </nav>

      {/* Official Telegram Support Banner */}
      <div className="p-3 m-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Official Support</span>
            <span className="text-[11px] text-amber-400 font-mono block">@betspaycloudadmin</span>
            <p className="text-[10px] text-slate-500 mt-1">24/7 Priority Gateway Assistance</p>
          </div>
        </div>
      </div>

    </aside>
  );
};
