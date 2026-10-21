"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useColorMode } from "@/components/ThemeRegistry";
import { formatCurrency } from "@/lib/utils";
import Skeleton from "@mui/material/Skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Utensils, CreditCard, Award } from "lucide-react";

export interface MonthlyTrendData {
  month: string;
  redemptions: number;
  savings: number;
}

export interface CategoryData {
  name: string;
  count: number;
  color: string;
}

export interface SubscriptionStats {
  monthlyActive: number;
  annualActive: number;
  inactive: number;
}

export interface TopMerchantData {
  name: string;
  redemptions: number;
  savings: number;
}

interface DashboardChartsProps {
  monthlyTrend: MonthlyTrendData[];
  categoryBreakdown: CategoryData[];
  subscriptionStats: SubscriptionStats;
  topMerchants: TopMerchantData[];
}

const PLAN_COLORS = ["#0ea5e9", "#10b981", "#94a3b8"];

export function DashboardCharts({
  monthlyTrend,
  categoryBreakdown,
  subscriptionStats,
  topMerchants,
}: DashboardChartsProps) {
  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const [mounted, setMounted] = useState(false);
  const [chartView, setChartView] = useState<"savings" | "redemptions">("savings");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, my: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 0 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 0 }} />
          </Grid>
        </Grid>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 0 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 0 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1";

  const subscriptionChartData = [
    {
      category: "Monthly Plan",
      Active: subscriptionStats.monthlyActive,
      fill: "#0ea5e9",
    },
    {
      category: "Annual Plan",
      Active: subscriptionStats.annualActive,
      fill: "#10b981",
    },
    {
      category: "Inactive / Expired",
      Active: subscriptionStats.inactive,
      fill: "#94a3b8",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, my: 1 }}>
      {/* ── ROW 1: Monthly Redemptions & Savings Trend + Category Distribution ── */}
      <Grid container spacing={2.5}>
        {/* Main Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <TrendingUp size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Redemption & Savings Activity
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Monthly progression of voucher claims and diners&apos; total savings (€)
                </Typography>
              </Box>

              {/* View Toggle */}
              <Tabs
                value={chartView}
                onChange={(_, v) => setChartView(v)}
                sx={{
                  minHeight: 34,
                  "& .MuiTab-root": {
                    minHeight: 32,
                    py: 0.5,
                    px: 1.75,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    borderRadius: 0,
                    textTransform: "none",
                  },
                }}
              >
                <Tab label="Total Savings (€)" value="savings" />
                <Tab label="Voucher Claims" value="redemptions" />
              </Tabs>
            </Box>

            <Box sx={{ width: "100%", height: 320, flex: 1, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="redemptionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke={textColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis
                    stroke={textColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (chartView === "savings" ? `€${v}` : v)}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: 0,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    formatter={(val: any) => [
                      chartView === "savings" ? formatCurrency(Number(val) || 0) : `${val} redemptions`,
                      chartView === "savings" ? "Member Savings" : "Voucher Redemptions",
                    ]}
                  />
                  {chartView === "savings" ? (
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#savingsGradient)"
                      activeDot={{ r: 6, fill: "#818cf8" }}
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="redemptions"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#redemptionsGradient)"
                      activeDot={{ r: 6, fill: "#fbbf24" }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Breakdown Donut */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Utensils size={20} color={isDark ? "#f59e0b" : "#d97706"} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  Venues by Category
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Partner distribution across gastronomic categories
              </Typography>
            </Box>

            <Box sx={{ width: "100%", height: 260, flex: 1, minHeight: 240, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: 0,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    formatter={(val: any, name: any) => [`${val} venues`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="rect"
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── ROW 2: Subscriptions Overview & Top Performing Partner Venues ── */}
      <Grid container spacing={2.5}>
        {/* Subscriptions Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <CreditCard size={20} color={isDark ? "#34d399" : "#10b981"} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  Membership Plan Breakdown
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Active dining club subscriber passes by billing frequency
              </Typography>
            </Box>

            <Box sx={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={subscriptionChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: 0,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="Active" barSize={38} radius={[0, 0, 0, 0]}>
                    {subscriptionChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Performing Merchants */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Award size={20} color={isDark ? "#fbbf24" : "#d97706"} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  Top Partner Venues by Redemptions
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Establishments with highest customer voucher engagement
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, justifyContent: "center" }}>
              {topMerchants.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  No merchant redemptions recorded yet
                </Typography>
              ) : (
                topMerchants.map((m, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0,
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: 0,
                          bgcolor: idx === 0 ? "primary.main" : "action.hover",
                          color: idx === 0 ? "#ffffff" : "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                          {m.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(m.savings)} savings delivered
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={`${m.redemptions} claims`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: 0,
                        bgcolor: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.08)",
                        color: isDark ? "primary.light" : "primary.main",
                        border: "1px solid",
                        borderColor: isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.2)",
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
