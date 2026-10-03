"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio,
  Sliders,
  Key,
  Globe,
  Lock,
  ArrowRight,
  Server,
  Receipt,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SettingsData {
  isConfigured: boolean;
  isLiveMode: boolean;
  connectionStatus: "CONNECTED" | "ERROR";
  connectionError: string | null;
  keys: {
    publishableKey: string | null;
    rawPublishableKey: string | null;
    secretKeyMasked: string;
    webhookSecretMasked: string;
  };
  webhookEndpoint: string;
  balance: {
    available: Array<{ amount: number; currency: string }>;
    pending: Array<{ amount: number; currency: string }>;
  } | null;
  defaultCurrency: string;
  monitoredEvents: string[];
}

export default function StripeSettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPubKey, setShowPubKey] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stripe/settings");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to load Stripe settings", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/stripe/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_connection" }),
      });
      const result = await res.json();
      setTestResult(result);
      if (result.success) {
        // Refresh balance
        load();
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || "Connection failed" });
    } finally {
      setTestingConnection(false);
    }
  }

  const availableAmount = data?.balance?.available?.[0]?.amount || 0;
  const pendingAmount = data?.balance?.pending?.[0]?.amount || 0;
  const currency = data?.balance?.available?.[0]?.currency || "EUR";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ======================================================== */}
      {/* 1. HEADER & ACTIONS                                     */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Stripe Account Settings
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                data?.isLiveMode
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {data?.isLiveMode ? "Production Mode" : "Sandbox Test Mode"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure gateway connectivity, manage API credentials, and monitor webhook events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap size={14} className={testingConnection ? "animate-spin text-amber-300" : ""} />
            <span>{testingConnection ? "Testing Gateway..." : "Test Connection"}</span>
          </button>

          <Link
            href="/admin/stripe/transactions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Receipt size={14} className="text-slate-600" />
            <span>View Transactions</span>
          </Link>

          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span>Stripe Dashboard</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DIAGNOSTIC ALERT & TEST RESULT                       */}
      {/* ======================================================== */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in duration-200 ${
            testResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {testResult.success ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {testResult.success
                  ? "Stripe API Connection Verified Successfully!"
                  : "Stripe Connection Test Failed"}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {testResult.success
                  ? `Response latency: ${testResult.latencyMs}ms • Authenticated with Stripe API servers.`
                  : testResult.error || "Please verify your STRIPE_SECRET_KEY configuration."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-xs font-bold px-2 py-1 rounded hover:bg-black/5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. OVERVIEW CARDS: STATUS & BALANCE                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gateway Status
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                data?.connectionStatus === "CONNECTED"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-rose-50 text-rose-600 border border-rose-100"
              }`}
            >
              <Radio size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  data?.connectionStatus === "CONNECTED"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-xl font-bold text-slate-900">
                {data?.connectionStatus === "CONNECTED" ? "Active & Connected" : "Connection Error"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data?.isLiveMode ? "Processing real customer charges" : "Test environment (simulated cards)"}
            </p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(availableAmount, currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ready for automated or manual payout
            </p>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Settlement
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(pendingAmount, currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Processing through Stripe banking clearance
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. API CREDENTIALS MANAGEMENT                           */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Key size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Stripe API Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Managed securely in the application environment variables.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={13} className="text-emerald-600" />
            <span>Environment Protected</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Publishable Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Publishable Key (Client Side)
              </label>
              <button
                onClick={() => setShowPubKey(!showPubKey)}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {showPubKey ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPubKey ? "Mask Key" : "Show Full Key"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  showPubKey
                    ? data?.keys?.rawPublishableKey || "Not configured"
                    : data?.keys?.publishableKey || "Not configured"
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-800 select-all focus:outline-none"
              />
              <button
                onClick={() =>
                  copyText("pub", data?.keys?.rawPublishableKey || "")
                }
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Copy Publishable Key"
              >
                {copiedKey === "pub" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used in mobile apps and web frontend for secure tokenization of payment methods.
            </p>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Secret Key (Server Side)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={data?.keys?.secretKeyMasked || "Not configured"}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-800 select-none focus:outline-none"
              />
              <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1 shrink-0">
                <CheckCircle2 size={13} />
                <span>Configured</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Restricted to backend API operations. Never exposed to browser or client applications.
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Webhook Signing Secret (STRIPE_WEBHOOK_SECRET)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={data?.keys?.webhookSecretMasked || "Not configured"}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-800 select-none focus:outline-none"
              />
              <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1 shrink-0">
                <CheckCircle2 size={13} />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used by <code className="font-mono text-indigo-600">/api/stripe/webhook</code> to verify event authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. WEBHOOK CONFIGURATION & MONITORED EVENTS             */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Webhook Integration
              </h2>
              <p className="text-xs text-slate-500">
                Real-time synchronization for payments and membership renewals.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Automated Sync
          </span>
        </div>

        {/* Webhook Endpoint */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Webhook Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={data?.webhookEndpoint || ""}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-800 select-all focus:outline-none"
            />
            <button
              onClick={() => copyText("webhook", data?.webhookEndpoint || "")}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              {copiedKey === "webhook" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>Copy URL</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Configure this exact URL in your Stripe Dashboard under Developers → Webhooks.
          </p>
        </div>

        {/* Monitored Events */}
        <div>
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Monitored Lifecycle Events
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(data?.monitoredEvents || []).map((ev) => (
              <div
                key={ev}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{ev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. BEST PRACTICES & GUIDE                               */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-3 border border-white/10">
            <ShieldCheck size={14} /> Production Readiness Checklist
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Switching from Sandbox to Live Processing
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            When ready to accept real payments, replace the test API keys in your production environment with your live keys (<code className="text-amber-300">sk_live_...</code> and <code className="text-amber-300">pk_live_...</code>), and set up the production webhook endpoint in your live Stripe account.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow transition-all inline-flex items-center gap-1.5"
            >
              <span>Manage Keys in Stripe</span>
              <ExternalLink size={13} />
            </a>
            <Link
              href="/admin/stripe/transactions"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
            >
              <span>Transactions Feed</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
