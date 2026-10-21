"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Receipt,
  Search,
  TrendingUp,
  RefreshCw,
  Download,
  User,
  Store,
  Tag,
  Eye,
  Copy,
  Check,
  X,
  Filter,
  Percent,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CustomerData {
  id?: number;
  fullname: string;
  email: string;
  phoneNumber?: string | null;
  imageUrl?: string | null;
}

interface MerchantData {
  id?: number;
  merchantCode?: string;
  nameEn: string;
  nameHr: string;
  descriptionEn?: string | null;
  descriptionHr?: string | null;
  category?: string;
  addressEn?: string | null;
  addressHr?: string | null;
  cityEn?: string | null;
  cityHr?: string | null;
  phone?: string | null;
  website?: string | null;
  images?: string[];
  isActive?: boolean;
  savingsEstimate?: number | null;
  avgRating?: number;
  ratingCount?: number;
}

interface OfferData {
  id?: number;
  titleEn: string;
  titleHr: string;
  descriptionEn?: string | null;
  descriptionHr?: string | null;
  discountEn?: string | null;
  discountHr?: string | null;
  offerAmount?: number | null;
  termsEn?: string | null;
  termsHr?: string | null;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

interface Redemption {
  id: string | number;
  customerId?: number;
  merchantId?: number;
  offerId?: number;
  savings: number;
  offerAmount?: number | null;
  offerDiscountEn?: string | null;
  offerDiscountHr?: string | null;
  redeemedAt: string;
  customer: CustomerData;
  merchant: MerchantData;
  offer: OfferData;
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

function getInitials(name: string, email: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email ? email.slice(0, 2).toUpperCase() : "CU";
}

function getAvatarGradient(id: string | number): string {
  const num = typeof id === "number" ? id : String(id).charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[num % AVATAR_GRADIENTS.length];
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [merchantFilter, setMerchantFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/redemptions?limit=250")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setRedemptions(data.redemptions || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load redemptions:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/redemptions?limit=250");
      const data = await res.json();
      setRedemptions(data.redemptions || []);
    } catch (err) {
      console.error("Failed to refresh redemptions:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Extract unique merchants for filtering
  const uniqueMerchants = useMemo(() => {
    const map = new Map<string, string>();
    redemptions.forEach((r) => {
      const name = r.merchant.nameEn || r.merchant.nameHr || "Unknown Merchant";
      if (!map.has(name)) {
        map.set(name, name);
      }
    });
    return Array.from(map.values()).sort();
  }, [redemptions]);

  // Filter & Sort
  const filtered = useMemo(() => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    return redemptions
      .filter((r) => {
        // Merchant filter
        if (merchantFilter !== "ALL") {
          const mName = (r.merchant.nameEn || r.merchant.nameHr || "").toLowerCase();
          if (mName !== merchantFilter.toLowerCase()) return false;
        }

        // Date filter
        if (dateFilter !== "ALL") {
          const itemTime = new Date(r.redeemedAt).getTime();
          const diff = now - itemTime;
          if (dateFilter === "TODAY" && diff > oneDay) return false;
          if (dateFilter === "7DAYS" && diff > sevenDays) return false;
          if (dateFilter === "30DAYS" && diff > thirtyDays) return false;
        }

        // Search text
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const customerName = (r.customer.fullname || "").toLowerCase();
        const customerEmail = (r.customer.email || "").toLowerCase();
        const customerPhone = (r.customer.phoneNumber || "").toLowerCase();
        const merchantEn = (r.merchant.nameEn || "").toLowerCase();
        const merchantHr = (r.merchant.nameHr || "").toLowerCase();
        const offerEn = (r.offer.titleEn || "").toLowerCase();
        const offerHr = (r.offer.titleHr || "").toLowerCase();
        const discount = (r.offerDiscountEn || r.offerDiscountHr || r.offer.discountEn || "").toLowerCase();
        const city = (r.merchant.cityEn || r.merchant.cityHr || "").toLowerCase();

        return (
          customerName.includes(q) ||
          customerEmail.includes(q) ||
          customerPhone.includes(q) ||
          merchantEn.includes(q) ||
          merchantHr.includes(q) ||
          offerEn.includes(q) ||
          offerHr.includes(q) ||
          discount.includes(q) ||
          city.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.redeemedAt).getTime() - new Date(b.redeemedAt).getTime();
        }
        if (sortBy === "SAVINGS_HIGH") {
          return b.savings - a.savings;
        }
        if (sortBy === "SAVINGS_LOW") {
          return a.savings - b.savings;
        }
        if (sortBy === "MERCHANT_AZ") {
          const nameA = a.merchant.nameEn || a.merchant.nameHr || "";
          const nameB = b.merchant.nameEn || b.merchant.nameHr || "";
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "CUSTOMER_AZ") {
          const nameA = a.customer.fullname || a.customer.email || "";
          const nameB = b.customer.fullname || b.customer.email || "";
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [redemptions, search, merchantFilter, dateFilter, sortBy]);

  // Statistics
  const totalSavings = useMemo(() => {
    return redemptions.reduce((s, r) => s + (r.savings || 0), 0);
  }, [redemptions]);

  const avgSavings = useMemo(() => {
    return redemptions.length > 0 ? totalSavings / redemptions.length : 0;
  }, [redemptions, totalSavings]);

  const uniqueMerchantsCount = useMemo(() => {
    return new Set(redemptions.map((r) => r.merchant.nameEn || r.merchant.nameHr)).size;
  }, [redemptions]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return redemptions.filter((r) => new Date(r.redeemedAt).toDateString() === today).length;
  }, [redemptions]);

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "Redemption ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Merchant Name",
      "Merchant City",
      "Offer Title",
      "Discount",
      "Savings (EUR)",
      "Redeemed At",
    ];

    const rows = filtered.map((r) => [
      `"${r.id}"`,
      `"${(r.customer.fullname || "").replace(/"/g, '""')}"`,
      `"${r.customer.email || ""}"`,
      `"${r.customer.phoneNumber || ""}"`,
      `"${(r.merchant.nameEn || r.merchant.nameHr || "").replace(/"/g, '""')}"`,
      `"${(r.merchant.cityEn || r.merchant.cityHr || "").replace(/"/g, '""')}"`,
      `"${(r.offer.titleEn || r.offer.titleHr || "").replace(/"/g, '""')}"`,
      `"${r.offerDiscountEn || r.offerDiscountHr || r.offer.discountEn || ""}"`,
      r.savings.toFixed(2),
      `"${new Date(r.redeemedAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `redemptions_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    search.trim() !== "" || merchantFilter !== "ALL" || dateFilter !== "ALL" || sortBy !== "NEWEST";

  const clearFilters = () => {
    setSearch("");
    setMerchantFilter("ALL");
    setDateFilter("ALL");
    setSortBy("NEWEST");
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER SECTION                                        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Redemptions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {redemptions.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track customer deal activations, merchant savings vouchers, and redemption history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Redemptions"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Download CSV report"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS KPI CARDS                                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Savings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalSavings)}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>Delivered to customers</span>
            </p>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Redemptions
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Receipt size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {redemptions.length}
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <Sparkles size={12} />
              <span>{todayCount} redeemed today</span>
            </p>
          </div>
        </div>

        {/* Average Savings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg Savings / Deal
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(avgSavings)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Per voucher redeemed</p>
          </div>
        </div>

        {/* Participating Merchants */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Redeemed Merchants
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Store size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {uniqueMerchantsCount}
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">Partner locations engaged</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTERS CONTROLS                             */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, merchant, offer…"
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Merchant filter */}
          <div className="relative">
            <select
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Merchants ({uniqueMerchants.length})</option>
              {uniqueMerchants.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today Only</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-medium cursor-pointer"
            >
              <option value="NEWEST">Newest Redeemed</option>
              <option value="OLDEST">Oldest Redeemed</option>
              <option value="SAVINGS_HIGH">Highest Savings (€)</option>
              <option value="SAVINGS_LOW">Lowest Savings (€)</option>
              <option value="MERCHANT_AZ">Merchant (A to Z)</option>
              <option value="CUSTOMER_AZ">Customer (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Filter stats & Clear action */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-800">{filtered.length}</strong> of{" "}
              {redemptions.length} redemptions
            </span>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                <Filter size={11} /> Filters active
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REDEMPTIONS DATA TABLE                                */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading redemptions data…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Receipt size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No redemptions found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No redemption matches your current search or filter criteria. Try adjusting your filters."
                  : "No customer redemptions have been recorded yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Offer Redeemed</th>
                  <th className="py-3.5 px-4">Merchant & Location</th>
                  <th className="py-3.5 px-4">Savings Delivered</th>
                  <th className="py-3.5 px-4">Redeemed Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const customerInitials = getInitials(r.customer.fullname, r.customer.email);
                  const gradient = getAvatarGradient(r.customer.id ?? r.id);
                  const discountLabel =
                    r.offerDiscountEn || r.offerDiscountHr || r.offer.discountEn || null;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRedemption(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {r.customer.imageUrl ? (
                            <Image
                              src={r.customer.imageUrl}
                              alt={r.customer.fullname || "Customer"}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                            >
                              {customerInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[200px]">
                              {r.customer.fullname || "Unnamed Customer"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {r.customer.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Offer */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[240px]">
                          <div className="font-semibold text-slate-800 truncate">
                            {r.offer.titleEn || r.offer.titleHr || "Special Offer"}
                          </div>
                          {discountLabel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Tag size={10} />
                              {discountLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Merchant */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-semibold text-slate-800 truncate">
                            {r.merchant.nameEn || r.merchant.nameHr}
                          </div>
                          {(r.merchant.cityEn || r.merchant.cityHr) && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span>{r.merchant.cityEn || r.merchant.cityHr}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Savings */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                          <TrendingUp size={13} className="text-emerald-600" />
                          <span>+{formatCurrency(r.savings)}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-700">
                            {formatDate(r.redeemedAt)}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            <span>
                              {new Date(r.redeemedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRedemption(r);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. REDEMPTION VOUCHER / RECEIPT MODAL                     */}
      {/* ======================================================== */}
      {selectedRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedRedemption(null)}
                className="absolute right-4 top-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>Verified Deal Redemption Voucher</span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Voucher #{selectedRedemption.id}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {formatDate(selectedRedemption.redeemedAt)} at{" "}
                    {new Date(selectedRedemption.redeemedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-200 block">
                    Savings
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    +{formatCurrency(selectedRedemption.savings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Customer Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <span>Customer Information</span>
                  <User size={13} />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                      selectedRedemption.customer.id ?? selectedRedemption.id
                    )} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                  >
                    {getInitials(
                      selectedRedemption.customer.fullname,
                      selectedRedemption.customer.email
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedRedemption.customer.fullname || "Unnamed Customer"}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{selectedRedemption.customer.email}</span>
                      <button
                        onClick={() =>
                          copyText("email", selectedRedemption.customer.email)
                        }
                        className="text-slate-400 hover:text-indigo-600 transition-colors ml-1"
                        title="Copy email"
                      >
                        {copiedKey === "email" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    </div>
                    {selectedRedemption.customer.phoneNumber && (
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Phone size={12} className="shrink-0" />
                        <span>{selectedRedemption.customer.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <span>Offer Activated</span>
                  <Tag size={13} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {selectedRedemption.offer.titleEn || selectedRedemption.offer.titleHr}
                  </h4>
                  {selectedRedemption.offer.titleHr &&
                    selectedRedemption.offer.titleEn !== selectedRedemption.offer.titleHr && (
                      <p className="text-slate-500 italic mt-0.5">
                        {selectedRedemption.offer.titleHr}
                      </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedRedemption.offerDiscountEn ||
                    selectedRedemption.offerDiscountHr ||
                    selectedRedemption.offer.discountEn) && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                      {selectedRedemption.offerDiscountEn ||
                        selectedRedemption.offerDiscountHr ||
                        selectedRedemption.offer.discountEn}
                    </span>
                  )}
                  {selectedRedemption.offerAmount && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                      Base Value: {formatCurrency(selectedRedemption.offerAmount)}
                    </span>
                  )}
                </div>

                {selectedRedemption.offer.descriptionEn && (
                  <p className="text-slate-600 leading-relaxed pt-1">
                    {selectedRedemption.offer.descriptionEn}
                  </p>
                )}
              </div>

              {/* Merchant Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <span>Merchant / Partner</span>
                  <Store size={13} />
                </div>
                <div className="pt-1">
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedRedemption.merchant.nameEn || selectedRedemption.merchant.nameHr}
                  </div>
                  {(selectedRedemption.merchant.addressEn ||
                    selectedRedemption.merchant.cityEn) && (
                    <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span>
                        {[
                          selectedRedemption.merchant.addressEn || selectedRedemption.merchant.addressHr,
                          selectedRedemption.merchant.cityEn || selectedRedemption.merchant.cityHr,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {selectedRedemption.merchant.phone && (
                    <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                      <Phone size={12} className="shrink-0 text-slate-400" />
                      <span>{selectedRedemption.merchant.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical / Audit Details */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span>Record ID: {selectedRedemption.id}</span>
                <button
                  onClick={() =>
                    copyText("redemptionId", String(selectedRedemption.id))
                  }
                  className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === "redemptionId" ? (
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  ) : (
                    <>
                      <Copy size={11} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedRedemption(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
