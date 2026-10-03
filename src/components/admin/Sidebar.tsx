"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Image from "next/image";
import {
  LayoutDashboard,
  Store,
  Tag,
  Users,
  UserCheck,
  Receipt,
  CreditCard,
  LayoutGrid,
  LogOut,
  Package,
  FileText,
  Headphones,
  ArrowLeftRight,
  Sliders,
  Search,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import { hasPermission, PermissionKey } from "@/lib/permissions";

const DRAWER_WIDTH = 275;

type Role = "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "SALESMAN";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  permissionKey?: PermissionKey;
  section: "OVERVIEW" | "HOSPITALITY" | "MEMBERSHIP & BILLING" | "ADMINISTRATION";
  badge?: string;
  keywords?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"],
    permissionKey: "dashboard",
    section: "OVERVIEW",
    keywords: ["home", "stats", "analytics", "kpi"],
  },
  {
    href: "/admin/merchants",
    label: "Merchants",
    icon: Store,
    roles: ["SUPER_ADMIN", "ADMIN", "SALESMAN"],
    permissionKey: "merchants",
    section: "HOSPITALITY",
    keywords: ["restaurants", "venues", "partners", "dining"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: LayoutGrid,
    roles: ["SUPER_ADMIN", "ADMIN"],
    permissionKey: "categories",
    section: "HOSPITALITY",
    keywords: ["types", "taxonomy", "dining tags"],
  },
  {
    href: "/admin/redemptions",
    label: "Redemptions",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "redemptions",
    section: "HOSPITALITY",
    keywords: ["vouchers", "claims", "discounts", "qr"],
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "customers",
    section: "MEMBERSHIP & BILLING",
    keywords: ["subscribers", "users", "clients", "members"],
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "subscriptions",
    section: "MEMBERSHIP & BILLING",
    keywords: ["membership", "plans", "billing", "revenue"],
  },
  {
    href: "/admin/subscription-packages",
    label: "Sub. Packages",
    icon: Package,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "subscription_packages",
    section: "MEMBERSHIP & BILLING",
    keywords: ["pricing", "tiers", "founder", "regular"],
  },
  {
    href: "/admin/stripe/transactions",
    label: "Stripe Charges",
    icon: ArrowLeftRight,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "subscriptions",
    section: "MEMBERSHIP & BILLING",
    badge: "Live",
    keywords: ["payments", "payment intents", "cards", "gateway", "checkout"],
  },
  {
    href: "/admin/stripe/settings",
    label: "Stripe Settings",
    icon: Sliders,
    roles: ["SUPER_ADMIN", "ADMIN"],
    permissionKey: "subscriptions",
    section: "MEMBERSHIP & BILLING",
    keywords: ["credentials", "api keys", "webhooks", "gateway config"],
  },
  {
    href: "/admin/promocodes",
    label: "Promo Codes",
    icon: Tag,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "offers",
    section: "MEMBERSHIP & BILLING",
    keywords: ["coupons", "discounts", "vouchers", "promotions"],
  },
  {
    href: "/admin/support",
    label: "Support Messages",
    icon: Headphones,
    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
    permissionKey: "support",
    section: "ADMINISTRATION",
    keywords: ["tickets", "help", "customer inquiries", "contact"],
  },
  {
    href: "/admin/terms",
    label: "Terms & Conditions",
    icon: FileText,
    roles: ["SUPER_ADMIN", "ADMIN"],
    permissionKey: "terms",
    section: "ADMINISTRATION",
    keywords: ["legal", "privacy", "agreement", "policy"],
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
    permissionKey: "users",
    section: "ADMINISTRATION",
    keywords: ["staff", "administrators", "roles", "permissions"],
  },
];

const SECTIONS = [
  "OVERVIEW",
  "HOSPITALITY",
  "MEMBERSHIP & BILLING",
  "ADMINISTRATION",
] as const;

export function AdminSidebar({ role, user }: { role: string; user?: any }) {
  const pathname = usePathname();
  const [filterQuery, setFilterQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const userObj = user || { role };

  // 1. Role-allowed items
  const allowedItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (role === "SUPER_ADMIN" && !Array.isArray(userObj.permissions)) return true;
      if (item.permissionKey) return hasPermission(userObj, item.permissionKey);
      return item.roles.includes(role as Role);
    });
  }, [role, userObj]);

  // 2. Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return allowedItems;

    return allowedItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchSection = item.section.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchSection || matchKeywords;
    });
  }, [allowedItems, filterQuery]);

  // Keyboard shortcut Ctrl+K or / to focus filter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setFilterQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #091e42 0%, #0a2550 40%, #071936 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        },
      }}
    >
      {/* ======================================================== */}
      {/* 1. BRAND LOGO HEADER                                    */}
      {/* ======================================================== */}
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/uzivaj_logo.png"
            alt="Ujivaj"
            width={112}
            height={42}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
          Admin
        </span>
      </Box>

      {/* ======================================================== */}
      {/* 2. FILTER SEARCH INPUT                                  */}
      {/* ======================================================== */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300/70 group-focus-within:text-amber-400 transition-colors">
            <Search size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter menu... (Ctrl+K)"
            className="w-full pl-9 pr-8 py-2.5 bg-white/10 hover:bg-white/[0.14] focus:bg-white/[0.18] border border-white/15 focus:border-amber-400/50 rounded-xl text-sm text-white placeholder-blue-200/50 focus:outline-none transition-all shadow-inner"
          />
          {filterQuery && (
            <button
              onClick={() => {
                setFilterQuery("");
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-blue-200/60 hover:text-white cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </Box>

      {/* ======================================================== */}
      {/* 3. NAVIGATION ITEMS LIST (FILTERABLE)                    */}
      {/* ======================================================== */}
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          py: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 4,
          },
        }}
      >
        {filteredItems.length === 0 ? (
          <div className="py-8 px-3 text-center text-sm text-blue-200/70">
            <p>No navigation items match &quot;{filterQuery}&quot;</p>
            <button
              onClick={() => setFilterQuery("")}
              className="mt-2 text-amber-300 hover:text-amber-200 underline font-semibold text-xs cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : filterQuery.trim() ? (
          /* Flat list when searching */
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300/70 flex items-center justify-between">
              <span>Matching Results</span>
              <span>{filteredItems.length} found</span>
            </div>
            {filteredItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
                    active
                      ? "bg-white/20 text-white font-semibold shadow-sm border border-white/20"
                      : "text-blue-100/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`transition-colors shrink-0 ${
                        active
                          ? "text-amber-400"
                          : "text-blue-300/70 group-hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-xs text-blue-300/60 uppercase">
                      {item.section.split(" ")[0]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Grouped section display when not filtering */
          <div className="space-y-4">
            {SECTIONS.map((sectionName) => {
              const sectionItems = allowedItems.filter(
                (item) => item.section === sectionName
              );
              if (sectionItems.length === 0) return null;

              return (
                <div key={sectionName} className="space-y-1">
                  <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-blue-200/60 select-none">
                    {sectionName}
                  </div>

                  {sectionItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer relative ${
                          active
                            ? "bg-white/20 text-white font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-white/25 backdrop-blur-sm"
                            : "text-blue-100/90 hover:bg-white/[0.09] hover:text-white"
                        }`}
                      >
                        {/* Active left indicator glow */}
                        {active && (
                          <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        )}

                        <div className="flex items-center gap-3 min-w-0 pl-1">
                          <span
                            className={`transition-colors shrink-0 ${
                              active
                                ? "text-amber-400 drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)]"
                                : "text-blue-300/70 group-hover:text-blue-100"
                            }`}
                          >
                            <Icon size={19} />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                            {item.badge}
                          </span>
                        ) : active ? (
                          <ChevronRight size={16} className="text-amber-400/80 shrink-0" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </Box>

      {/* ======================================================== */}
      {/* 4. FOOTER: USER BADGE & SIGN OUT                        */}
      {/* ======================================================== */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-400/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign out</span>
          </div>
          <span className="text-xs text-blue-200/60 uppercase tracking-wider font-medium">
            v2.4
          </span>
        </button>
      </Box>
    </Drawer>
  );
}
