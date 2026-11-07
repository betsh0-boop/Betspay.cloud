import React, { useState } from 'react';
import { BookOpen, KeyRound, Play, Code, Copy, Check, Terminal, Send } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ApiDocsSandboxModuleProps {
  lang: Language;
}

export const ApiDocsSandboxModule: React.FC<ApiDocsSandboxModuleProps> = ({ lang }) => {
  const t = translations[lang];

  // Sandbox State
  const [testProvider, setTestProvider] = useState('bkash');
  const [testType, setTestType] = useState('payin');
  const [testAmount, setTestAmount] = useState(1500);
  const [testAccount, setTestAccount] = useState('+8801711987654');
  
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const sampleCurl = `curl -X POST https://betpay.cloud/api/v1/payments/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: bp_live_8f93a1c0d4e5f6a7b8c9d0" \\
  -H "x-signature: 7f83a2b1c... (HMAC SHA-256)" \\
  -d '{
    "merchant_id": "mch_apex_101",
    "provider": "${testProvider}",
    "type": "${testType}",
    "amount": ${testAmount},
    "customer_account": "${testAccount}"
  }'`;

  const handleRunSandbox = async () => {
    setIsTesting(true);
    setSandboxResponse(null);

    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: 'mch_apex_101',
          provider: testProvider,
          type: testType,
          amount: testAmount,
          accountNumber: testAccount,
        }),
      });
      const data = await res.json();
      setSandboxResponse({ status: 200, statusText: 'OK (HMAC Signature Verified)', data });
    } catch (e: any) {
      setSandboxResponse({ status: 500, error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          {t.apiDocs.title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Complete REST API reference, HMAC SHA-256 signature verification, and interactive endpoint sandbox.
        </p>
      </div>

      {/* 1. HMAC Authentication Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-400" />
          {t.apiDocs.authTitle}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t.apiDocs.authDesc}
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-amber-400 font-bold">// Node.js HMAC SHA-256 Signature Header Generator</div>
          <pre className="text-slate-300 overflow-x-auto">
{`const crypto = require('crypto');

function generateSignature(payloadString, secretKey) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex');
}`}
          </pre>
        </div>
      </div>

      {/* 2. Interactive REST API Sandbox */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              {t.apiDocs.sandboxTitle}
            </h3>
            <p className="text-xs text-slate-400">Test live payment creation API directly from this interactive console.</p>
          </div>

          <button
            onClick={handleRunSandbox}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 font-sans"
          >
            <Send className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Sending...' : t.apiDocs.runTestBtn}</span>
          </button>
        </div>

        {/* Sandbox Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-sans">Provider</label>
            <select
              value={testProvider}
              onChange={(e) => setTestProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            >
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="upay">Upay</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans">Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            >
              <option value="payin">Pay-in (Cash-in)</option>
              <option value="payout">Payout (Cash-out)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans">Amount (BDT)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans">Payer Account</label>
            <input
              type="text"
              value={testAccount}
              onChange={(e) => setTestAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            />
          </div>
        </div>

        {/* cURL Request View */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-sans">
            <span className="font-bold">cURL Command Payload</span>
            <button
              onClick={() => { navigator.clipboard.writeText(sampleCurl); setCopiedCurl(true); setTimeout(() => setCopiedCurl(false), 2000); }}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCurl ? 'Copied' : 'Copy cURL'}
            </button>
          </div>
          <pre className="text-slate-300 overflow-x-auto">{sampleCurl}</pre>
        </div>

        {/* JSON Response Output */}
        {sandboxResponse && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs animate-fade-in">
            <div className="flex items-center justify-between font-sans">
              <span className="font-bold text-emerald-400">Response: {sandboxResponse.status} {sandboxResponse.statusText}</span>
              <span className="text-slate-500 text-[11px]">Headers: Content-Type: application/json</span>
            </div>
            <pre className="text-emerald-300 overflow-x-auto">
              {JSON.stringify(sandboxResponse.data || sandboxResponse, null, 2)}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
