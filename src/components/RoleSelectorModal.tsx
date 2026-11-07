import React from 'react';
import { ShieldCheck, UserCheck, AlertTriangle, X, Check, Lock, Zap } from 'lucide-react';
import { Role, Merchant, Language } from '../types';
import { translations } from '../i18n/translations';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  setRole: (r: Role) => void;
  selectedMerchant: Merchant | null;
  setSelectedMerchant: (m: Merchant | null) => void;
  merchants: Merchant[];
  lang: Language;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  role,
  setRole,
  selectedMerchant,
  setSelectedMerchant,
  merchants,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const handleSelectSuperAdmin = () => {
    setRole('super_admin');
    setSelectedMerchant(null);
    onClose();
  };

  const handleSelectMerchant = (m: Merchant) => {
    setRole('merchant');
    setSelectedMerchant(m);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Account & Access Role</h3>
              <p className="text-xs text-slate-400">Switch between Super Admin & Merchant Demo Profiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Super Admin Profile */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Platform Administration
            </span>

            <button
              onClick={handleSelectSuperAdmin}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                role === 'super_admin'
                  ? 'bg-blue-600/10 border-blue-500/80 ring-1 ring-blue-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Super Admin Console</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Full Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    admin@betpay.cloud · Manage all merchants, MFS accounts, USDT approvals & fraud alerts
                  </p>
                </div>
              </div>
              {role === 'super_admin' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>

          {/* 2. Merchant Profiles */}
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Merchant Accounts (Preset Scenarios)
            </span>

            <div className="space-y-2.5">
              {merchants.map((m) => {
                const isSelected = role === 'merchant' && selectedMerchant?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMerchant(m)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/80 ring-1 ring-blue-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{m.name}</span>
                          {m.status === 'active' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              LIVE APPROVED
                            </span>
                          )}
                          {m.status === 'demo' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              DEMO MODE
                            </span>
                          )}
                          {m.status === 'suspended' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {m.email} · Fee: {m.commissionRate}% · Daily Limit: Tk {m.dailyLimit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
            <p className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <Lock className="w-3.5 h-3.5" /> No Public Self-Registration
            </p>
            Public merchant registration is disabled per security guidelines. Only Super Admin can provision new merchant accounts.
          </div>

        </div>

      </div>
    </div>
  );
};
