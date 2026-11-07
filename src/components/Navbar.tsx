import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  Sun, 
  Moon, 
  Headphones, 
  Layers, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Download
} from 'lucide-react';
import { Role, Language, Merchant } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  role: Role;
  setRole: (r: Role) => void;
  selectedMerchant: Merchant | null;
  setSelectedMerchant: (m: Merchant | null) => void;
  merchants: Merchant[];
  lang: Language;
  setLang: (l: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
  onOpenRoleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  selectedMerchant,
  lang,
  setLang,
  isDarkMode,
  setIsDarkMode,
  onOpenRoleModal,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const t = translations[lang];

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/v1/download-source-base64');
      if (!res.ok) throw new Error('ZIP fetch error');
      const data = await res.json();
      
      const byteCharacters = atob(data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'betspay-global-full-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.location.href = '/api/v1/download-source';
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-amber-500 p-0.5 shadow-lg shadow-blue-900/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-amber-400 tracking-wider">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                  BETSPAY <span className="text-amber-400">GLOBAL</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {t.brand.domain}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.brand.subtitle}
              </p>
            </div>
          </div>

          {/* Zone 2: Account Role & Environment Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all text-xs font-medium group"
            >
              <div className="flex items-center gap-1.5">
                {role === 'super_admin' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-blue-400" />
                )}
                <span className="font-semibold text-white">
                  {role === 'super_admin' ? 'Super Admin' : selectedMerchant?.name || 'Merchant'}
                </span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-xs text-slate-400 group-hover:text-amber-400 transition-colors flex items-center gap-1">
                {role === 'super_admin' ? (
                  'Full Control'
                ) : selectedMerchant?.status === 'active' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LIVE
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> DEMO MODE
                  </span>
                )}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Official Support Link Button */}
            <a
              href="https://t.me/betspaycloudadmin"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 text-xs transition-colors"
              title="Official Telegram Support"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.brand.support}</span>
            </a>
          </div>

          {/* Zone 3: Actions (Language Switcher, Theme Toggle, Role Preset Launcher) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  lang === 'zh'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                中文
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Export ZIP Source Download Button */}
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Full Project Source (.ZIP)"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isDownloading ? 'Preparing...' : 'Export ZIP'}</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            {/* Quick Demo Switcher CTA */}
            <button
              onClick={onOpenRoleModal}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.switchRole}</span>
              <span className="sm:hidden">Switch</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
