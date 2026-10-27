import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { Users, Store, Tag, Receipt, CreditCard, TrendingUp, ShieldCheck, Ticket, FileText, ArrowRight } from "lucide-react";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

async function getStats() {
  const [
    totalUsers,
    totalMerchants,
    totalOffers,
    totalRedemptions,
    activeSubscriptions,
    totalStaff,
    totalPromoCodes,
    recentRedemptions,
    allRedemptions,
    categoryCounts,
    monthlySubs,
    annualSubs,
    inactiveSubs,
    topRedemptionsGroup,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.redemption.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.promoCode.count({ where: { isActive: true } }),
    prisma.redemption.findMany({
      take: 6,
      orderBy: { redeemedAt: "desc" },
      include: {
        customer: { select: { fullname: true, email: true } },
        merchant: { select: { nameEn: true, nameHr: true } },
        offer: { select: { titleEn: true, titleHr: true } },
      },
    }),
    prisma.redemption.findMany({
      select: { redeemedAt: true, savings: true },
      orderBy: { redeemedAt: "asc" },
    }),
    prisma.merchant.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { isActive: true },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: "MONTHLY" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: "ANNUAL" } }),
    prisma.subscription.count({ where: { status: { in: ["EXPIRED", "CANCELLED"] } } }),
    prisma.redemption.groupBy({
      by: ["merchantId"],
      _count: { id: true },
      _sum: { savings: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  const savings = await prisma.redemption.aggregate({ _sum: { savings: true } });

  // 1. Monthly trend (last 6 calendar months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const monthlyTrendMap = new Map<string, { month: string; redemptions: number; savings: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = monthNames[d.getMonth()];
    monthlyTrendMap.set(key, { month: label, redemptions: 0, savings: 0 });
  }

  for (const r of allRedemptions) {
    const d = new Date(r.redeemedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyTrendMap.has(key)) {
      const item = monthlyTrendMap.get(key)!;
      item.redemptions += 1;
      item.savings += Math.round((Number(r.savings) || 0) * 100) / 100;
    }
  }

  const monthlyTrend = Array.from(monthlyTrendMap.values());

  // 2. Category Breakdown
  const categoryMeta: Record<string, { label: string; color: string }> = {
    CASUAL_DINING: { label: "Casual Dining", color: "#6366f1" },
    PREMIUM_DINING: { label: "Premium Dining", color: "#f59e0b" },
    CAFES: { label: "Cafés & Bakeries", color: "#10b981" },
    BRUNCH: { label: "Brunch & Breakfast", color: "#ec4899" },
    BARS_NIGHTLIFE: { label: "Bars & Nightlife", color: "#8b5cf6" },
  };

  const categoryBreakdown = categoryCounts.map((c) => ({
    name: categoryMeta[c.category]?.label || c.category,
    count: c._count.id,
    color: categoryMeta[c.category]?.color || "#0ea5e9",
  }));

  // 3. Subscriptions breakdown
  const subscriptionStats = {
    monthlyActive: monthlySubs,
    annualActive: annualSubs,
    inactive: inactiveSubs,
  };

  // 4. Top merchants by redemptions
  const merchantIds = topRedemptionsGroup.map((t) => t.merchantId);
  const merchantsList =
    merchantIds.length > 0
      ? await prisma.merchant.findMany({
          where: { id: { in: merchantIds } },
          select: { id: true, nameEn: true, nameHr: true },
        })
      : [];
  const merchantMap = new Map(merchantsList.map((m) => [m.id, m.nameEn || m.nameHr]));

  const topMerchants = topRedemptionsGroup.map((t) => ({
    name: merchantMap.get(t.merchantId) || `Venue #${t.merchantId}`,
    redemptions: t._count.id,
    savings: t._sum.savings ?? 0,
  }));

  return {
    totalUsers,
    totalMerchants,
    totalOffers,
    totalRedemptions,
    activeSubscriptions,
    totalStaff,
    totalPromoCodes,
    recentRedemptions,
    totalSavings: savings._sum.savings ?? 0,
    monthlyTrend,
    categoryBreakdown,
    subscriptionStats,
    topMerchants,
  };
}

const statCards = (stats: Awaited<ReturnType<typeof getStats>>) => [
  { label: "Total Users",        value: stats.totalUsers,                   icon: Users,        gradient: "linear-gradient(135deg, #6366f1, #4f46e5)", bgLight: "rgba(99, 102, 241, 0.12)", color: "#6366f1" },
  { label: "Active Merchants",   value: stats.totalMerchants,               icon: Store,        gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)", bgLight: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" },
  { label: "Active Offers",      value: stats.totalOffers,                  icon: Tag,          gradient: "linear-gradient(135deg, #ec4899, #db2777)", bgLight: "rgba(236, 72, 153, 0.12)", color: "#ec4899" },
  { label: "Redemptions",        value: stats.totalRedemptions,             icon: Receipt,      gradient: "linear-gradient(135deg, #f97316, #ea580c)", bgLight: "rgba(249, 115, 22, 0.12)", color: "#f97316" },
  { label: "Subscriptions",      value: stats.activeSubscriptions,          icon: CreditCard,   gradient: "linear-gradient(135deg, #10b981, #059669)", bgLight: "rgba(16, 185, 129, 0.12)", color: "#10b981" },
  { label: "Total Savings",      value: formatCurrency(stats.totalSavings), icon: TrendingUp,   gradient: "linear-gradient(135deg, #f59e0b, #d97706)", bgLight: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" },
  { label: "Promo Codes",        value: stats.totalPromoCodes,              icon: Ticket,       gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", bgLight: "rgba(6, 182, 212, 0.12)",  color: "#06b6d4" },
  { label: "Staff Users",        value: stats.totalStaff,                   icon: ShieldCheck,  gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", bgLight: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Dashboard Top Banner */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Dashboard
            </Typography>
            <Chip label="Live Metrics" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 0 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here is an overview of platform performance and redemption activity.
          </Typography>
        </Box>
      </Box>

      {/* Stat cards grid: 4 widgets in a row on medium and larger screens */}
      <Grid container spacing={2.5}>
        {statCards(stats).map(({ label, value, icon: Icon, bgLight, color }) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 0,
                borderColor: "divider",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: 2,
                  borderColor: color,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ minWidth: 0, mr: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }} noWrap>
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em", fontSize: { xs: "1.4rem", sm: "1.6rem", xl: "1.75rem" } }} noWrap>
                    {value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0,
                    backgroundColor: bgLight,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 14px ${bgLight}`,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Graphical Statistics & Performance Charts */}
      <DashboardCharts
        monthlyTrend={stats.monthlyTrend}
        categoryBreakdown={stats.categoryBreakdown}
        subscriptionStats={stats.subscriptionStats}
        topMerchants={stats.topMerchants}
      />

      {/* Terms & Conditions Management Shortcut */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 0,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={22} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Terms & Conditions Management
              </Typography>
              <Chip label="HR / EN Rich Editor" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: 0 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              Publish, preview, and update dual-language platform policies with rich HTML formatting.
            </Typography>
          </Box>
        </Box>
        <Link
          href="/admin/terms"
          style={{ textDecoration: "none" }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1.25,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              fontSize: "0.875rem",
              borderRadius: 0,
              transition: "opacity 0.2s",
              "&:hover": { opacity: 0.9 },
              flexShrink: 0,
            }}
          >
            <span>Open Terms Editor</span>
            <ArrowRight size={16} />
          </Box>
        </Link>
      </Paper>

      {/* Recent redemptions table */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 0,
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Recent Member Redemptions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest voucher claims verified at partner establishments
            </Typography>
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Offer & Merchant</TableCell>
              <TableCell align="right">Claimed At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recentRedemptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No redemptions recorded yet
                </TableCell>
              </TableRow>
            ) : (
              stats.recentRedemptions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          bgcolor: "action.selected",
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {(r.customer.fullname || r.customer.email)[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.customer.fullname || "Anonymous User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.offer.titleEn || r.offer.titleHr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      at {r.merchant.nameEn || r.merchant.nameHr}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {formatDate(r.redeemedAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
