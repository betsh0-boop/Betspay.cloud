import React, { useState } from 'react';
import { HelpCircle, Search, Headphones, BookOpen, ShieldCheck, ChevronDown, ChevronRight, Send, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HelpCenterModuleProps {
  lang: Language;
}

export const HelpCenterModule: React.FC<HelpCenterModuleProps> = ({ lang }) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Support Ticket Modal state
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    {
      q: lang === 'en' ? 'How are new merchant accounts provisioned?' : '新商户账号是如何开通的？',
      a: lang === 'en' 
        ? 'Merchants cannot self-register. Accounts are created exclusively by the Super Admin through the Merchant Management dashboard.'
        : '平台不支持公共自主注册。所有商户账号必须由超级管理员通过商户管理后台手动创建开通。'
    },
    {
      q: lang === 'en' ? 'What is DEMO MODE and how do I activate LIVE status?' : '什么是 DEMO 演示模式？如何激活正式 Live 权限？',
      a: lang === 'en'
        ? 'New merchant accounts start in preview DEMO MODE. Live payment processing and bank disbursements are unlocked once a USDT deposit is verified and approved by the Super Admin.'
        : '新创建的商户账号默认处于 DEMO 演示模式。通过 USDT 押金充值验证并经超级管理员审核批准后，即可开启正式 Live 生产权限。'
    },
    {
      q: lang === 'en' ? 'Which MFS providers are supported?' : '平台支持哪些 MFS 移动金融渠道？',
      a: lang === 'en'
        ? 'BETSPAY GLOBAL officially integrates bKash, Nagad, Rocket, Upay, and USDT TRC20/ERC20 settlement pools.'
        : 'BETSPAY GLOBAL 官方原生支持 bKash、Nagad、DBBL Rocket、UCB Upay 以及 USDT TRC20/ERC20 资金池。'
    },
    {
      q: lang === 'en' ? 'How does the Android Companion SMS Parser application work?' : 'Android 伴侣短信解析 App 是如何工作的？',
      a: lang === 'en'
        ? 'The Kotlin companion app runs on authorized business Android devices. It parses incoming MFS SMS notifications, extracts the Amount and TrxID, and syncs them directly with the gateway.'
        : 'Kotlin 伴侣 App 运行于授权的业务 Android 设备上。它实时解析收到的 MFS 官方短信，精准提取金额与 TrxID，并自动同至网关接口。'
    },
    {
      q: lang === 'en' ? 'What security rules protect account data?' : '平台采取了哪些安全保障措施？',
      a: lang === 'en'
        ? 'BETSPAY GLOBAL strictly forbids storing MFS PINs, OTPs, or passwords. All API calls require HMAC SHA-256 signatures, and device sync requires explicit authorization keys.'
        : '平台严禁存储任何 MFS PIN 码、验证码或密码。所有 API 请求均要求 HMAC SHA-256 签名，设备同步要求显式授权密钥。'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setIsTicketOpen(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            {t.help.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Documentation, integration guides, security rules, and priority support.
          </p>
        </div>

        {/* Official Telegram Link CTA */}
        <a
          href="https://t.me/betspaycloudadmin"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 shrink-0"
        >
          <Headphones className="w-4 h-4 text-amber-400" />
          <span>{t.help.telegramSupport}</span>
        </a>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.help.searchPlaceholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Guide Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">1. Merchant Onboarding & Roles</h3>
          <p className="text-xs text-slate-400">Super Admin creation flow, DEMO MODE preview, and USDT activation criteria.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">2. MFS & Wallet Float Setup</h3>
          <p className="text-xs text-slate-400">bKash, Nagad, Rocket, Upay wallet limits, daily reserves, and float float balances.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">3. API HMAC & Webhook Guide</h3>
          <p className="text-xs text-slate-400">Signed HTTP requests, rate limits, error codes, and asynchronous webhook callbacks.</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white mb-2">{t.help.faq}</h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-xs font-bold text-white flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Modal Launcher */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Need Custom Integration Support?</h3>
          <p className="text-xs text-slate-400">Submit a support ticket directly to our senior engineering team.</p>
        </div>
        <button
          onClick={() => setIsTicketOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
        >
          Submit Support Ticket
        </button>
      </div>

      {/* Ticket Modal */}
      {isTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Submit Gateway Support Ticket</h3>
              <button onClick={() => setIsTicketOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {ticketSent ? (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Ticket Submitted! Our team will contact @betspaycloudadmin.
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Webhook signature mismatch inquiry"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 font-sans pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                  >
                    Send Ticket
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
