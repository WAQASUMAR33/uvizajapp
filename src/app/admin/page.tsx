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
import { Users, Store, Tag, Receipt, CreditCard, TrendingUp } from "lucide-react";

async function getStats() {
  const [totalUsers, totalMerchants, totalOffers, totalRedemptions, activeSubscriptions, recentRedemptions] =
    await Promise.all([
      prisma.user.count(),
      prisma.merchant.count({ where: { isActive: true } }),
      prisma.offer.count({ where: { isActive: true } }),
      prisma.redemption.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.redemption.findMany({
        take: 6,
        orderBy: { redeemedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          merchant: { select: { name: true } },
          offer: { select: { title: true } },
        },
      }),
    ]);
  const savings = await prisma.redemption.aggregate({ _sum: { savings: true } });
  return { totalUsers, totalMerchants, totalOffers, totalRedemptions, activeSubscriptions, recentRedemptions, totalSavings: savings._sum.savings ?? 0 };
}

const statCards = (stats: Awaited<ReturnType<typeof getStats>>) => [
  { label: "Total Users",        value: stats.totalUsers,           icon: Users,       bg: "#ede9fe", color: "#6d28d9" },
  { label: "Active Merchants",   value: stats.totalMerchants,       icon: Store,       bg: "#e0e7ff", color: "#4338ca" },
  { label: "Active Offers",      value: stats.totalOffers,          icon: Tag,         bg: "#fce7f3", color: "#be185d" },
  { label: "Redemptions",        value: stats.totalRedemptions,     icon: Receipt,     bg: "#ffedd5", color: "#c2410c" },
  { label: "Subscriptions",      value: stats.activeSubscriptions,  icon: CreditCard,  bg: "#d1fae5", color: "#065f46" },
  { label: "Total Savings",      value: formatCurrency(stats.totalSavings), icon: TrendingUp, bg: "#fef3c7", color: "#92400e" },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <Box sx={{ spaceY: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back! Here's what's happening with Ujivaj.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards(stats).map(({ label, value, icon: Icon, bg, color }) => (
          <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={label}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{value}</Typography>
                </Box>
                <Box sx={{ width: 52, height: 52, borderRadius: 3, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={24} color={color} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent redemptions */}
      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Redemptions</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Offer & Merchant</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recentRedemptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No redemptions yet
                </TableCell>
              </TableRow>
            ) : (
              stats.recentRedemptions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }}>
                        {(r.user.name || r.user.email)[0].toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.user.name || r.user.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.offer.title}</Typography>
                    <Typography variant="caption" color="text.secondary">at {r.merchant.name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary">{formatDate(r.redeemedAt)}</Typography>
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
