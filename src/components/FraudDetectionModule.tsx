import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Eye, FileText, Lock } from 'lucide-react';
import { FraudAlert, Language } from '../types';
import { translations } from '../i18n/translations';

interface FraudDetectionModuleProps {
  fraudAlerts: FraudAlert[];
  lang: Language;
}

export const FraudDetectionModule: React.FC<FraudDetectionModuleProps> = ({ fraudAlerts: initialAlerts, lang }) => {
  const t = translations[lang];
  const [alerts, setAlerts] = useState<FraudAlert[]>(initialAlerts);

  const handleUpdateStatus = (id: string, status: FraudAlert['status']) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            {t.fraud.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated transaction anomaly detection and merchant risk flags.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          {alerts.filter(a => a.status === 'open').length} High-Risk Alerts Active
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-medium flex items-center gap-2">
        <Lock className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Compliance Enforcement: Never automatically confiscate or transfer funds based only on a risk alert. Manual review required.</span>
      </div>

      {/* Alert Stream List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-5 rounded-2xl border transition-all ${
              alert.severity === 'high' 
                ? 'bg-slate-900 border-rose-500/40' 
                : 'bg-slate-900 border-amber-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    alert.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {alert.severity} SEVERITY
                  </span>
                  <h3 className="text-sm font-bold text-white">{alert.type}</h3>
                </div>

                <p className="text-xs text-slate-300 mt-1">{alert.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-2">
                  <span>Merchant: <strong className="text-white font-sans">{alert.merchantName}</strong></span>
                  <span>·</span>
                  <span>TxID: <strong className="text-amber-400">{alert.txId}</strong></span>
                  <span>·</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-sans">
                {alert.status === 'open' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold"
                    >
                      {t.fraud.investigate}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      {t.fraud.dismiss}
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 text-xs font-semibold">
                    Status: {alert.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
