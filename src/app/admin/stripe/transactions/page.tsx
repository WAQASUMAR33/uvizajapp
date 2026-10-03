"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Filter,
  Copy,
  Check,
  X,
  Settings,
  ShieldCheck,
  TrendingUp,
  Receipt,
  User,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  chargeId: string | null;
  amount: number;
  amountReceived: number;
  currency: string;
  status: string;
  livemode: boolean;
  created: string;
  customer: {
    id: string | null;
    localId: number | null;
    name: string;
    email: string;
  };
  paymentMethod: {
    type: string;
    brand: string | null;
    last4: string | null;
  };
  plan: string;
  packageId: string | null;
  promoCode: string | null;
  receiptUrl: string | null;
  clientSecret?: string;
}

interface Metrics {
  totalVolume: number;
  totalCount: number;
  successfulCount: number;
  failedCount: number;
  processingCount: number;
  currency: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  succeeded: {
    label: "Succeeded",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  requires_payment_method: {
    label: "Incomplete",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  requires_action: {
    label: "Action Required",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500 animate-pulse",
  },
  canceled: {
    label: "Canceled",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export default function StripeTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/admin/stripe/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
      setMetrics(data.metrics || null);
    } catch (e) {
      console.error("Failed to load Stripe transactions", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  // Filtered & Sorted list
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const id = t.id.toLowerCase();
        const name = (t.customer.name || "").toLowerCase();
        const email = (t.customer.email || "").toLowerCase();
        const custId = (t.customer.id || "").toLowerCase();

        return id.includes(q) || name.includes(q) || email.includes(q) || custId.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        }
        if (sortBy === "AMOUNT_HIGH") {
          return b.amount - a.amount;
        }
        if (sortBy === "AMOUNT_LOW") {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, statusFilter, search, sortBy]);

  // Export CSV
  function exportCSV() {
    const headers = [
      "Payment Intent ID",
      "Customer Name",
      "Customer Email",
      "Amount",
      "Currency",
      "Status",
      "Brand",
      "Last 4",
      "Date",
    ];

    const rows = filtered.map((t) => [
      t.id,
      `"${t.customer.name}"`,
      `"${t.customer.email}"`,
      t.amount,
      t.currency,
      t.status,
      t.paymentMethod.brand || "card",
      t.paymentMethod.last4 || "",
      t.created,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stripe_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const isLive = transactions[0]?.livemode || false;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER & QUICK NAVIGATION                            */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Stripe Transactions
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isLive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {isLive ? "Live Mode" : "Test Mode"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Direct feed of customer charges, payment intents, and authorization logs from Stripe.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Stripe transactions"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export CSV</span>
          </button>

          <a
            href="https://dashboard.stripe.com/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span>Stripe Dashboard</span>
            <ExternalLink size={13} />
          </a>

          <Link
            href="/admin/stripe/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Stripe Settings</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS KPI CARDS                                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captured Volume */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Captured Volume
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(metrics?.totalVolume || 0, metrics?.currency || "EUR")}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Successfully paid & authorized
            </div>
          </div>
        </div>

        {/* Succeeded Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Succeeded Charges
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics?.successfulCount || 0}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {metrics?.totalCount
                ? `${Math.round(((metrics.successfulCount || 0) / metrics.totalCount) * 100)}% conversion rate`
                : "No transactions"}
            </div>
          </div>
        </div>

        {/* Incomplete / In Progress */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Incomplete / Pending
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {(metrics?.failedCount || 0) + (metrics?.processingCount || 0)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Requires customer checkout completion
            </div>
          </div>
        </div>

        {/* Average Transaction Value */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg. Transaction
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <CreditCard size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(
                metrics?.successfulCount && metrics.successfulCount > 0
                  ? (metrics.totalVolume || 0) / metrics.successfulCount
                  : 0,
                metrics?.currency || "EUR"
              )}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Average per successful charge
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TOOLBAR: SEARCH & STATUS TABS                        */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PaymentIntent ID, customer name, email..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start lg:self-auto border border-slate-200/60">
            {[
              { id: "ALL", label: "All" },
              { id: "succeeded", label: "Succeeded" },
              { id: "requires_payment_method", label: "Incomplete" },
              { id: "canceled", label: "Canceled" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-auto text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown size={13} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="AMOUNT_HIGH">Highest Amount</option>
              <option value="AMOUNT_LOW">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TRANSACTIONS TABLE                                    */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Fetching Stripe payment intents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No transactions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No Stripe payment records matched your search or status criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((t) => {
                  const sc = STATUS_CONFIG[t.status] || {
                    label: t.status,
                    badge: "bg-slate-100 text-slate-700 border-slate-200",
                    dot: "bg-slate-400",
                  };

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTx(t)}
                    >
                      {/* ID Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
                          <span>{t.id.slice(0, 16)}...</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(t.id, t.id);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Copy PaymentIntent ID"
                          >
                            {copiedKey === t.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        {t.chargeId && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Charge: {t.chargeId.slice(0, 12)}...
                          </div>
                        )}
                      </td>

                      {/* Customer Column */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {t.customer.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t.customer.email}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(t.amount, t.currency)}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {t.plan} Plan
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium capitalize">
                          <CreditCard size={14} className="text-slate-400" />
                          <span>
                            {t.paymentMethod.brand || t.paymentMethod.type || "Card"}
                            {t.paymentMethod.last4 ? ` •••• ${t.paymentMethod.last4}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {formatDate(t.created)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(t.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {t.receiptUrl && (
                            <a
                              href={t.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 inline-flex items-center gap-1"
                              title="Open customer receipt"
                            >
                              <span>Receipt</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(t);
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="py-3 px-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{" "}
            <strong className="text-slate-800">{transactions.length}</strong> payment intents
          </span>
          <span className="text-[11px] text-slate-400">
            Transactions retrieved live via Stripe API
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. TRANSACTION DETAILS MODAL DIALOG                     */}
      {/* ======================================================== */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Payment Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedTx.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              {/* Financial Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Amount
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {formatCurrency(selectedTx.amount, selectedTx.currency)}
                  </div>
                  <span className="text-xs text-slate-500 capitalize">
                    {selectedTx.plan} Plan
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        STATUS_CONFIG[selectedTx.status]?.badge || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {STATUS_CONFIG[selectedTx.status]?.label || selectedTx.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </span>
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{selectedTx.customer.name}</span>
                  {selectedTx.customer.localId && (
                    <span className="text-xs text-slate-500">
                      User ID: #{selectedTx.customer.localId}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600">
                  {selectedTx.customer.email}
                </div>
                {selectedTx.customer.id && (
                  <div className="text-xs text-slate-400 font-mono pt-1">
                    Stripe Customer: {selectedTx.customer.id}
                  </div>
                )}
              </div>

              {/* Payment Method & Charge ID */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Payment Method
                </span>
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold capitalize">
                    {selectedTx.paymentMethod.brand || "Card"}
                    {selectedTx.paymentMethod.last4 ? ` (ending in ${selectedTx.paymentMethod.last4})` : ""}
                  </span>
                  <span className="text-slate-400 uppercase">
                    Type: {selectedTx.paymentMethod.type}
                  </span>
                </div>
                {selectedTx.chargeId && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-mono">
                    <span className="text-slate-500">Charge ID:</span>
                    <span>{selectedTx.chargeId}</span>
                  </div>
                )}
              </div>

              {/* Timestamp & Environment */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Created Date
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {formatDate(selectedTx.created)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Environment
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedTx.livemode ? "Production (Live)" : "Sandbox (Test)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://dashboard.stripe.com/payments/${selectedTx.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View in Stripe Dashboard</span>
                <ExternalLink size={13} />
              </a>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
