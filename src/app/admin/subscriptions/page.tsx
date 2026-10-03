"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Crown,
  Tag,
  Users,
  TrendingUp,
  Coins,
  RefreshCw,
  Download,
  Calendar,
  Smartphone,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Filter,
  Package,
  Clock,
  ArrowUpDown,
  Ban,
  AlertTriangle
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface PromoCodeRecord {
  id: number;
  code: string;
  titleEn: string;
  titleHr?: string;
  discountType: string;
  discountValue: number;
}

interface SubscriptionPackage {
  id: number;
  titleEn: string;
  titleHr: string;
}

interface Sub {
  id: number | string;
  customerId?: number;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  platform: string | null;
  paymentRef?: string | null;
  promoCode: string | null;
  discountAmount: number | null;
  customer: { fullname: string; email: string };
  subscriptionPackage?: SubscriptionPackage | null;
  promoCodeRecord?: PromoCodeRecord | null;
  createdAt?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  EXPIRED: {
    label: "Expired",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

const AVATAR_COLORS = [
  "from-indigo-500 to-indigo-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

function getInitials(name: string, email: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email[0] || "U").toUpperCase();
}

function getAvatarColor(name: string, email: string): string {
  const str = name || email || "user";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [selectedSub, setSelectedSub] = useState<Sub | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [confirmCancelSub, setConfirmCancelSub] = useState<Sub | null>(null);
  const [cancellingId, setCancellingId] = useState<number | string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/list");
      const data = await res.json();
      setSubs(data.subscriptions || []);
    } catch (e) {
      console.error("Failed to load subscriptions", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Copy to clipboard helper
  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  // Cancel Stripe / Database Subscription
  async function handleCancelSubscription(sub: Sub) {
    setCancellingId(sub.id);
    try {
      const res = await fetch("/api/admin/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: sub.id,
          customerId: sub.customerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      // Update local state list
      setSubs((prev) =>
        prev.map((item) =>
          item.id === sub.id ? { ...item, status: "CANCELLED" } : item
        )
      );

      // Update selected modal sub if open
      if (selectedSub && selectedSub.id === sub.id) {
        setSelectedSub((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      }

      setNotification({
        type: "success",
        message: data.message || `Subscription #${sub.id} has been cancelled successfully.`,
      });
      setConfirmCancelSub(null);
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.message || "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setCancellingId(null);
    }
  }

  // Filtered & Sorted Subscriptions
  const filtered = useMemo(() => {
    return subs
      .filter((s) => {
        // Status filter
        if (statusFilter !== "ALL" && s.status !== statusFilter) return false;

        // Platform filter
        if (platformFilter !== "ALL") {
          const plat = (s.platform || "web").toLowerCase();
          if (plat !== platformFilter.toLowerCase()) return false;
        }

        // Search query
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const fullname = (s.customer.fullname || "").toLowerCase();
        const email = (s.customer.email || "").toLowerCase();
        const promo = (s.promoCode || "").toLowerCase();
        const pkg = (s.subscriptionPackage?.titleEn || "").toLowerCase();
        const plan = (s.plan || "").toLowerCase();
        const payment = (s.paymentRef || "").toLowerCase();

        return (
          fullname.includes(q) ||
          email.includes(q) ||
          promo.includes(q) ||
          pkg.includes(q) ||
          plan.includes(q) ||
          payment.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        if (sortBy === "PRICE_HIGH") {
          return b.price - a.price;
        }
        if (sortBy === "PRICE_LOW") {
          return a.price - b.price;
        }
        if (sortBy === "EXPIRING_SOON") {
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        return 0;
      });
  }, [subs, statusFilter, platformFilter, search, sortBy]);

  // Analytics Metrics
  const activeSubs = subs.filter((s) => s.status === "ACTIVE");
  const totalRevenue = activeSubs.reduce((sum, s) => sum + s.price, 0);
  const avgOrderValue = activeSubs.length > 0 ? totalRevenue / activeSubs.length : 0;
  const promoCount = subs.filter((s) => s.promoCode || (s.discountAmount && s.discountAmount > 0)).length;
  const totalDiscountGiven = subs.reduce((sum, s) => sum + (s.discountAmount || 0), 0);

  // Status counts for pills
  const statusCounts = useMemo(() => {
    return {
      ALL: subs.length,
      ACTIVE: subs.filter((s) => s.status === "ACTIVE").length,
      EXPIRED: subs.filter((s) => s.status === "EXPIRED").length,
      CANCELLED: subs.filter((s) => s.status === "CANCELLED").length,
    };
  }, [subs]);

  // Export to CSV
  function exportCSV() {
    const headers = [
      "ID",
      "Customer Name",
      "Customer Email",
      "Package",
      "Plan",
      "Status",
      "Price",
      "Currency",
      "Coupon Code",
      "Discount Amount",
      "Platform",
      "Payment Ref",
      "Start Date",
      "End Date",
    ];

    const rows = filtered.map((s) => [
      s.id,
      `"${s.customer.fullname || ""}"`,
      `"${s.customer.email || ""}"`,
      `"${s.subscriptionPackage?.titleEn || s.plan}"`,
      s.plan,
      s.status,
      s.price,
      s.currency,
      s.promoCode || "",
      s.discountAmount || 0,
      s.platform || "web",
      s.paymentRef || "",
      s.startDate,
      s.endDate,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & QUICK ACTIONS                            */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subscriptions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Gateway
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of active subscriber tiers, recurring revenue, and coupon discounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh subscription data"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Export filtered subscriptions to CSV"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/subscription-packages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Package size={14} />
            <span>Manage Packages</span>
          </Link>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium animate-in fade-in duration-200 border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs"
              : "bg-rose-50 text-rose-800 border-rose-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STATS KPI CARDS                                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscribers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Subscribers
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <Users size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeSubs.length}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {subs.length > 0 ? Math.round((activeSubs.length / subs.length) * 100) : 0}%
              </span>
              <span>of total {subs.length} records</span>
            </div>
          </div>
        </div>

        {/* Card 2: Recurring Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <CreditCard size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="text-indigo-600 font-semibold">Active ARR pool</span>
              <span>• billed through gateways</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Order Value (AOV) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(avgOrderValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span>Avg per active member</span>
            </div>
          </div>
        </div>

        {/* Card 4: Coupons & Discounts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Coupons Applied
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
              <Tag size={19} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {promoCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="text-rose-600 font-semibold">-{formatCurrency(totalDiscountGiven)}</span>
              <span>total discounts granted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER, SEARCH & CONTROLS TOOLBAR                     */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top filter row: Search + Status Tabs */}
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
              placeholder="Search by customer, email, coupon, package, payment ref..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start lg:self-auto border border-slate-200/60">
            {(["ALL", "ACTIVE", "EXPIRED", "CANCELLED"] as const).map((status) => {
              const active = statusFilter === status;
              const count = statusCounts[status];
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="capitalize">{status.toLowerCase()}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-indigo-50 text-indigo-700" : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary controls row: Platform + Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter size={13} /> Platform:
            </span>
            {(["ALL", "android", "ios", "web"] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                  platformFilter.toLowerCase() === plat.toLowerCase()
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {plat === "ALL" ? "All Platforms" : plat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown size={13} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="PRICE_HIGH">Highest Price</option>
              <option value="PRICE_LOW">Lowest Price</option>
              <option value="EXPIRING_SOON">Expiring Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SUBSCRIPTION TABLE                                    */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading subscription records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <Crown size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No subscriptions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No subscription records matched your selected search filters. Try clearing filters or searching with a different term.
            </p>
            {(search || statusFilter !== "ALL" || platformFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPlatformFilter("ALL");
                }}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Subscriber</th>
                  <th className="py-3.5 px-4">Package & Tier</th>
                  <th className="py-3.5 px-4">Pricing & Coupon</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timeline / Expiry</th>
                  <th className="py-3.5 px-4">Gateway / Platform</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((s) => {
                  const sc = STATUS_CONFIG[s.status] || STATUS_CONFIG.CANCELLED;
                  const isFounder = (s.subscriptionPackage?.titleEn || "").toLowerCase().includes("founder");
                  const daysLeft = Math.ceil(
                    (new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSub(s)}
                    >
                      {/* Subscriber Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(
                              s.customer.fullname,
                              s.customer.email
                            )} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}
                          >
                            {getInitials(s.customer.fullname, s.customer.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {s.customer.fullname || "Anonymous Subscriber"}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <span>{s.customer.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Package & Tier Column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {isFounder ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Crown size={12} className="text-amber-600" />
                                {s.subscriptionPackage?.titleEn || "Founder Package"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Package size={12} />
                                {s.subscriptionPackage?.titleEn || s.plan}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium pl-1 flex items-center gap-1">
                            <Calendar size={11} />
                            {s.plan} Interval
                          </span>
                        </div>
                      </td>

                      {/* Pricing & Coupon */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {formatCurrency(s.price, s.currency)}
                          </span>
                          {s.promoCode ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-bold text-[10px] border border-violet-200">
                                <Tag size={10} />
                                {s.promoCode}
                              </span>
                              {s.discountAmount ? (
                                <span className="text-[11px] text-rose-600 font-bold">
                                  (-{formatCurrency(s.discountAmount, s.currency)})
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400">Regular rate</div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Timeline / Expiry */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <div className="font-semibold text-slate-800">
                            {formatDate(s.endDate)}
                          </div>
                          <div className="text-[11px] mt-0.5">
                            {daysLeft > 0 ? (
                              <span className="text-emerald-600 font-medium">
                                {daysLeft} days remaining
                              </span>
                            ) : (
                              <span className="text-rose-500 font-medium">Expired</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gateway / Platform */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-semibold capitalize text-slate-700">
                            {s.platform === "android" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                                <Smartphone size={12} /> Android
                              </span>
                            ) : s.platform === "ios" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                                <Smartphone size={12} /> iOS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
                                <Globe size={12} /> Web
                              </span>
                            )}
                          </div>
                          {s.paymentRef && (
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                              {s.paymentRef}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {s.status === "ACTIVE" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmCancelSub(s);
                              }}
                              disabled={cancellingId === s.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                              title="Cancel subscription in Stripe & database"
                            >
                              <Ban size={13} className={cancellingId === s.id ? "animate-spin" : ""} />
                              <span>Cancel</span>
                            </button>
                          ) : s.status === "CANCELLED" ? (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                              Cancelled
                            </span>
                          ) : null}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSub(s);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                          >
                            View
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

        {/* Table Footer Summary */}
        <div className="py-3 px-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{" "}
            <strong className="text-slate-800">{subs.length}</strong> total subscriptions
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view complete subscription breakdown
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SUBSCRIPTION DETAIL MODAL DIALOG                     */}
      {/* ======================================================== */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Subscription #{selectedSub.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSub.customer.fullname || selectedSub.customer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
              {/* Subscriber Info Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Customer Profile
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {selectedSub.customer.fullname || "N/A"}
                  </span>
                  <span className="text-xs text-slate-500">
                    ID: {selectedSub.customerId || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{selectedSub.customer.email}</span>
                  <button
                    onClick={() => copyText("email", selectedSub.customer.email)}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedKey === "email" ? (
                      <>
                        <Check size={12} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Package & Plan Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Package Title
                  </span>
                  <p className="font-bold text-slate-900 mt-1">
                    {selectedSub.subscriptionPackage?.titleEn || selectedSub.plan}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Croatian: {selectedSub.subscriptionPackage?.titleHr || "—"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Billing Cycle
                  </span>
                  <p className="font-bold text-slate-900 mt-1">{selectedSub.plan}</p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    Platform: {selectedSub.platform || "Web"}
                  </p>
                </div>
              </div>

              {/* Financial & Pricing Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Financial Settlement
                </span>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Plan Amount Paid:</span>
                  <span className="font-bold text-slate-900 text-base">
                    {formatCurrency(selectedSub.price, selectedSub.currency)}
                  </span>
                </div>

                {selectedSub.promoCode && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Tag size={12} className="text-indigo-600" />
                      Promo Code ({selectedSub.promoCode}):
                    </span>
                    <span className="font-bold text-rose-600">
                      -{formatCurrency(selectedSub.discountAmount || 0, selectedSub.currency)}
                    </span>
                  </div>
                )}

                {selectedSub.paymentRef && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gateway Ref:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <span>{selectedSub.paymentRef}</span>
                      <button
                        onClick={() => copyText("ref", selectedSub.paymentRef!)}
                        className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        title="Copy reference ID"
                      >
                        {copiedKey === "ref" ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates & Timeline */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Start Date
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {formatDate(selectedSub.startDate)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Expiration Date
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {formatDate(selectedSub.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedSub.status === "ACTIVE" ? (
                <button
                  onClick={() => setConfirmCancelSub(selectedSub)}
                  disabled={cancellingId === selectedSub.id}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Ban size={14} />
                  <span>Cancel Stripe Subscription</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  Status: {selectedSub.status}
                </span>
              )}

              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CONFIRM CANCEL SUBSCRIPTION DIALOG                   */}
      {/* ======================================================== */}
      {confirmCancelSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-xs">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Cancel Stripe Subscription?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to cancel the subscription for{" "}
                <strong className="text-slate-800">
                  {confirmCancelSub.customer.fullname || confirmCancelSub.customer.email}
                </strong>
                ?
              </p>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Package / Plan:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmCancelSub.subscriptionPackage?.titleEn || confirmCancelSub.plan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rate:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(confirmCancelSub.price, confirmCancelSub.currency)}
                  </span>
                </div>
                {confirmCancelSub.paymentRef && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Payment Ref:</span>
                    <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]">
                      {confirmCancelSub.paymentRef}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-rose-700 bg-rose-50/70 p-3 rounded-xl border border-rose-200/60 mt-3 leading-relaxed">
                ⚠️ This action will immediately cancel any recurring billing on Stripe and update the subscriber record to <strong>CANCELLED</strong>.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setConfirmCancelSub(null)}
                  disabled={cancellingId !== null}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => handleCancelSubscription(confirmCancelSub)}
                  disabled={cancellingId !== null}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {cancellingId === confirmCancelSub.id ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Ban size={13} />
                      <span>Yes, Cancel Subscription</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
