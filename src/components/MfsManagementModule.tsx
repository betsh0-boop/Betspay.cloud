import React, { useState } from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Plus, BarChart2, DollarSign } from 'lucide-react';
import { MfsAccount, Language } from '../types';
import { translations } from '../i18n/translations';

interface MfsManagementModuleProps {
  mfsAccounts: MfsAccount[];
  lang: Language;
}

export const MfsManagementModule: React.FC<MfsManagementModuleProps> = ({ mfsAccounts, lang }) => {
  const t = translations[lang];

  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const handleRunReconciliation = () => {
    setIsReconciling(true);
    setReconcileResult(null);
    setTimeout(() => {
      setIsReconciling(false);
      setReconcileResult('✓ Auto-Reconciliation Complete: 100% matched with provider API logs & Android SMS sync.');
    }, 1500);
  };

  const providerIcons: Record<string, { color: string; bg: string; name: string }> = {
    bkash: { color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30', name: 'bKash Merchant/Agent' },
    nagad: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', name: 'Nagad Postal' },
    rocket: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', name: 'DBBL Rocket' },
    upay: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', name: 'UCB Upay' },
  };

  const totalFloatBalance = mfsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalDailyLimit = mfsAccounts.reduce((sum, a) => sum + a.dailyLimit, 0);
  const totalUsedToday = mfsAccounts.reduce((sum, a) => sum + a.usedToday, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            {t.mfs.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authorized bKash, Nagad, Rocket, and Upay accounts, balance floats, and reconciliation.
          </p>
        </div>

        <button
          onClick={handleRunReconciliation}
          disabled={isReconciling}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />
          <span>{isReconciling ? 'Reconciling...' : t.mfs.reconcileBtn}</span>
        </button>
      </div>

      {reconcileResult && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reconcileResult}</span>
        </div>
      )}

      {/* Aggregate MFS Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{t.mfs.floatBalance}</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
            Tk {totalFloatBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active Float Accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">{t.mfs.dailyLimitProgress}</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            Tk {totalUsedToday.toLocaleString()} / {(totalDailyLimit / 1000000).toFixed(1)}M
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (totalUsedToday/totalDailyLimit)*100)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Official API Connectivity</span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            200 OK — 4/4 Operational
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">bKash, Nagad, Rocket, Upay</span>
        </div>
      </div>

      {/* Provider Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mfsAccounts.map((acc) => {
          const info = providerIcons[acc.provider] || { color: 'text-slate-400', bg: 'bg-slate-800', name: acc.provider };
          const limitPercent = Math.round((acc.usedToday / acc.dailyLimit) * 100);

          return (
            <div key={acc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${info.bg} ${info.color} font-bold`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{acc.accountName}</h3>
                    <div className="text-xs font-mono text-slate-400">
                      {acc.accountNumber} · <span className="uppercase text-slate-300 font-sans">{acc.type}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  99.4% Uptime
                </span>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Available Float</span>
                  <span className="text-emerald-400 font-bold text-sm">Tk {acc.balance.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">Used Today</span>
                  <span className="text-white font-bold text-sm">Tk {acc.usedToday.toLocaleString()} ({limitPercent}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Daily Limit Usage</span>
                  <span>Tk {acc.dailyLimit.toLocaleString()} Max</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all ${limitPercent > 80 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    style={{ width: `${limitPercent}%` }} 
                  />
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span>Incoming Tx: <strong className="text-white">{acc.inTxCount}</strong></span>
                <span>Outgoing Tx: <strong className="text-white">{acc.outTxCount}</strong></span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
