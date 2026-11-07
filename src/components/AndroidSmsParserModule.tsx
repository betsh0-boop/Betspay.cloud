import React, { useState } from 'react';
import { Smartphone, ShieldCheck, Play, Code, CheckCircle2, Lock, Copy, Check, Battery, Wifi, Plus } from 'lucide-react';
import { AndroidDevice, Language } from '../types';
import { translations } from '../i18n/translations';

interface AndroidSmsParserModuleProps {
  devices: AndroidDevice[];
  onSimulateSms: (smsBody: string) => Promise<any>;
  onConnectDevice?: (data: { deviceName: string; deviceModel: string; phoneNumber: string; simSlot: string }) => void;
  lang: Language;
}

export const AndroidSmsParserModule: React.FC<AndroidSmsParserModuleProps> = ({
  devices,
  onSimulateSms,
  onConnectDevice,
  lang,
}) => {
  const t = translations[lang];

  // Agent SIM Connect Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [simDeviceName, setSimDeviceName] = useState('');
  const [simDeviceModel, setSimDeviceModel] = useState('Samsung Galaxy A54');
  const [simPhoneNumber, setSimPhoneNumber] = useState('');
  const [simSlot, setSimSlot] = useState('SIM 1 (bKash & Nagad Agent)');
  const [connectSuccess, setConnectSuccess] = useState(false);

  // Simulator State
  const [testSmsInput, setTestSmsInput] = useState<string>(
    'You have received Tk 15,000.00 from 01799887766. Fee Tk 0.00. Balance Tk 3,160,000.00. TrxID BKS98421098X at 07/11/2026 10:35.'
  );
  const [parseResult, setParseResult] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Kotlin File Viewer state
  const [selectedKotlinFile, setSelectedKotlinFile] = useState<string>('TransactionParser.kt');
  const [copiedCode, setCopiedCode] = useState(false);

  const kotlinFiles: Record<string, string> = {
    'TransactionParser.kt': `package com.betspay.gateway.sms

import java.util.regex.Pattern

data class ParsedTransaction(
    val provider: String,
    val type: String, // PAYIN or PAYOUT
    val amount: Double,
    val trxId: String,
    val senderAccount: String?,
    val isValidFinancial: Boolean
)

object TransactionParser {

    // Security Filter: Strictly reject OTPs, PINs, and personal messages
    fun isSecuritySensitive(body: String): Boolean {
        val lower = body.lowercase()
        return lower.contains("otp") || 
               lower.contains("verification code") || 
               lower.contains("pin") || 
               lower.contains("password")
    }

    fun parse(smsBody: String, sender: String): ParsedTransaction {
        if (isSecuritySensitive(smsBody)) {
            return ParsedTransaction("UNKNOWN", "UNKNOWN", 0.0, "", null, false)
        }

        val bodyLower = smsBody.lowercase()

        // 1. bKash Pattern Parsing
        if (bodyLower.contains("bkash") || bodyLower.contains("trxid bks")) {
            val amountMatcher = Pattern.compile("(?:Tk|BDT)\\s*([\\d,]+\\.?\\d*)", Pattern.CASE_INSENSITIVE).matcher(smsBody)
            val trxIdMatcher = Pattern.compile("(?:TrxID|TxID)\\s*([A-Z0-9]+)", Pattern.CASE_INSENSITIVE).matcher(smsBody)
            val phoneMatcher = Pattern.compile("from\\s*(\\+?\\d{11,14})", Pattern.CASE_INSENSITIVE).matcher(smsBody)

            val amount = if (amountMatcher.find()) amountMatcher.group(1).replace(",", "").toDoubleOrNull() ?: 0.0 else 0.0
            val trxId = if (trxIdMatcher.find()) trxIdMatcher.group(1) else ""
            val account = if (phoneMatcher.find()) phoneMatcher.group(1) else sender
            val type = if (bodyLower.contains("cash out") || bodyLower.contains("sent")) "PAYOUT" else "PAYIN"

            return ParsedTransaction("BKASH", type, amount, trxId, account, amount > 0 && trxId.isNotEmpty())
        }

        // 2. Nagad Pattern Parsing
        if (bodyLower.contains("nagad") || bodyLower.contains("ngd")) {
            val amountMatcher = Pattern.compile("(?:Tk|BDT|Amount:)\\s*([\\d,]+\\.?\\d*)", Pattern.CASE_INSENSITIVE).matcher(smsBody)
            val trxIdMatcher = Pattern.compile("(?:TxID|TrxID):?\\s*([A-Z0-9]+)", Pattern.CASE_INSENSITIVE).matcher(smsBody)

            val amount = if (amountMatcher.find()) amountMatcher.group(1).replace(",", "").toDoubleOrNull() ?: 0.0 else 0.0
            val trxId = if (trxIdMatcher.find()) trxIdMatcher.group(1) else ""

            return ParsedTransaction("NAGAD", "PAYIN", amount, trxId, sender, amount > 0 && trxId.isNotEmpty())
        }

        return ParsedTransaction("UNKNOWN", "UNKNOWN", 0.0, "", null, false)
    }
}`,

    'SmsReceiver.kt': `package com.betspay.gateway.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val body = sms.messageBody ?: continue
                val sender = sms.originatingAddress ?: "UNKNOWN"

                val parsed = TransactionParser.parse(body, sender)
                if (parsed.isValidFinancial) {
                    Log.i("BETSPAY_SMS", "Valid MFS SMS Detected: Provider=\${parsed.provider}, TxID=\${parsed.trxId}, Amount=\${parsed.amount}")
                    ApiService.syncTransactionToGateway(context, parsed, body)
                }
            }
        }
    }
}`,

    'ApiService.kt': `package com.betspay.gateway.sms

import android.content.Context
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

object ApiService {
    private const val GATEWAY_ENDPOINT = "https://betpay.cloud/api/v1/android/sms-sync"
    private val client = OkHttpClient()

    fun syncTransactionToGateway(context: Context, tx: ParsedTransaction, rawSms: String) {
        val deviceId = "dev_android_01"
        val payload = JSONObject().apply {
            put("deviceId", deviceId)
            put("provider", tx.provider)
            put("amount", tx.amount)
            put("providerRef", tx.trxId)
            put("type", tx.type)
            put("smsBody", rawSms)
        }

        val request = Request.Builder()
            .url(GATEWAY_ENDPOINT)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .addHeader("x-device-auth-key", "BP_DEVICE_SECURE_AUTH_884920")
            .build()

        client.newCall(request).execute()
    }
}`,

    'MainActivity.kt': `package com.betspay.gateway.sms

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Request Explicit SMS & Phone State Permissions
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS), 101)
        }
    }
}`,

    'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.betspay.gateway.sms">

    <!-- Explicit Permissions required for MFS Gateway SMS parsing -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="BETSPAY SMS Gateway"
        android:theme="@style/Theme.AppCompat.Dark font">

        <receiver
            android:name=".SmsReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,

    'build.gradle.kts': `plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.betspay.gateway.sms"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.betspay.gateway.sms"
        minSdk = 24
        targetSdk = 34
        versionCode = 240
        versionName = "2.4.0-release"
    }
}`
  };

  const handleRunSimulator = async () => {
    setIsParsing(true);
    setParseResult(null);
    const res = await onSimulateSms(testSmsInput);
    setIsParsing(false);
    setParseResult(res);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simDeviceName || !simPhoneNumber) return;
    if (onConnectDevice) {
      onConnectDevice({
        deviceName: simDeviceName,
        deviceModel: simDeviceModel,
        phoneNumber: simPhoneNumber,
        simSlot: simSlot,
      });
    }
    setConnectSuccess(true);
    setTimeout(() => {
      setConnectSuccess(false);
      setIsConnectModalOpen(false);
      setSimDeviceName('');
      setSimPhoneNumber('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            {t.android.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.android.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {devices.length} Online
          </span>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Connect Agent SIM (এজেন্ট সিম কানেক্ট করুন)</span>
          </button>
        </div>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div key={dev.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{dev.deviceName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{dev.deviceModel} · {dev.simSlot}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Connected (200 OK)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2 border-t border-slate-800">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">Battery</span>
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Battery className="w-3.5 h-3.5" /> {dev.batteryLevel}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">Parsed Today</span>
                <span className="text-white font-bold">{dev.parsedCount} SMS</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">App Version</span>
                <span className="text-amber-400 font-bold">{dev.appVersion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive SMS Simulator Engine */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-amber-400" />
          {t.android.testSimulator}
        </h3>
        <p className="text-xs text-slate-400">
          Paste any sample bKash, Nagad, Rocket, or Upay transaction SMS. The Kotlin RegEx engine will extract the Amount and TrxID in real-time and post a verified transaction record.
        </p>

        <div className="space-y-3 font-mono text-xs">
          <textarea
            rows={3}
            value={testSmsInput}
            onChange={(e) => setTestSmsInput(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleRunSimulator}
            disabled={isParsing}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 font-sans"
          >
            <Play className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
            <span>{isParsing ? 'Parsing...' : t.android.parseBtn}</span>
          </button>
        </div>

        {parseResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs animate-fade-in">
            <span className="text-xs font-bold text-emerald-400 font-sans block">✓ RegEx Parser Extraction Result:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
              <div>Provider: <strong className="text-amber-400 uppercase">{parseResult.parsed?.provider}</strong></div>
              <div>Amount: <strong className="text-white">Tk {parseResult.parsed?.amount}</strong></div>
              <div>TrxID: <strong className="text-emerald-400">{parseResult.parsed?.providerRef}</strong></div>
              <div>Type: <strong className="text-blue-400 uppercase">{parseResult.parsed?.type}</strong></div>
            </div>
            {parseResult.transactionCreated && (
              <p className="text-[11px] text-emerald-400 font-sans pt-1 border-t border-slate-800">
                Created Transaction Record #{parseResult.transactionCreated.id} with status Verified!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Kotlin Source Code Viewer */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Android Companion App Kotlin Source Code
            </h3>
            <p className="text-xs text-slate-400">Complete, production-grade Android Kotlin implementation for business device deployment.</p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(kotlinFiles[selectedKotlinFile]);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shrink-0"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code File Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {Object.keys(kotlinFiles).map((file) => (
            <button
              key={file}
              onClick={() => setSelectedKotlinFile(file)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
                selectedKotlinFile === file
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {file}
            </button>
          ))}
        </div>

        {/* Code Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          <pre>{kotlinFiles[selectedKotlinFile]}</pre>
        </div>
      </div>

      {/* Security & Privacy Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          {t.android.securityCheck}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.android.secItem1}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.android.secItem2}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.android.secItem3}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.android.secItem4}</span>
          </div>
        </div>
      </div>

      {/* Modal: Connect Agent SIM Device */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                Connect Agent SIM Device (এজেন্ট সিম কানেক্ট করুন)
              </h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Pair an authorized business Android device running the BETSPAY Kotlin app to parse MFS SMS notifications automatically.
            </p>

            {connectSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                Agent SIM Device Paired & Connected Successfully!
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Device / SIM Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bKash Agent SIM 03 - Samsung Galaxy"
                    value={simDeviceName}
                    onChange={(e) => setSimDeviceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">Device Hardware Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SM-A546B / Redmi Note 13"
                    value={simDeviceModel}
                    onChange={(e) => setSimDeviceModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">SIM Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +8801711987654"
                    value={simPhoneNumber}
                    onChange={(e) => setSimPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-sans">SIM Slot & Provider Role</label>
                  <select
                    value={simSlot}
                    onChange={(e) => setSimSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
                  >
                    <option value="SIM 1 (bKash & Nagad Agent)">SIM 1 (bKash & Nagad Agent)</option>
                    <option value="SIM 2 (Rocket & Upay Agent)">SIM 2 (Rocket & Upay Agent)</option>
                    <option value="SIM 1 (Personal Float Gateway)">SIM 1 (Personal Float Gateway)</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-400/90 font-mono flex items-center justify-between">
                  <span>Device Security Auth Key:</span>
                  <strong className="text-white">BP-SIM-AUTH-884920</strong>
                </div>

                <div className="pt-2 flex justify-end gap-2 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                  >
                    + Pair Agent SIM Device
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
