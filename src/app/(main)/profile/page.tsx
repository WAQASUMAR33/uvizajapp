import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MuiButton from "@mui/material/Button";
import { Crown, Receipt, Calendar, TrendingDown } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      redemptions: {
        include: {
          offer: { select: { title: true, discount: true } },
          merchant: { select: { name: true, images: true } },
        },
        orderBy: { redeemedAt: "desc" },
        take: 10,
      },
    },
  });
  if (!user) redirect("/login");

  const totalSavings = user.redemptions.reduce((sum, r) => sum + r.savings, 0);
  const isPaid = user.role === "PAID_SUBSCRIBER" || user.role === "ADMIN";

  const ROLE_MAP: Record<string, { label: string; bg: string; color: string }> = {
    GUEST:           { label: "Guest",      bg: "#f1f5f9", color: "#475569" },
    REGISTERED:      { label: "Registered", bg: "#e0e7ff", color: "#4338ca" },
    PAID_SUBSCRIBER: { label: "Subscriber", bg: "#fef3c7", color: "#92400e" },
    ADMIN:           { label: "Admin",      bg: "#d1fae5", color: "#065f46" },
  };
  const role = ROLE_MAP[user.role] ?? ROLE_MAP.GUEST;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 4 }}>

      {/* Profile header */}
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: "divider", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar sx={{ width: 64, height: 64, fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 3 }}>
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.name || "No name set"}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              <Chip label={role.label} size="small" sx={{ mt: 1, bgcolor: role.bg, color: role.color, fontWeight: 600, fontSize: "0.72rem" }} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Calendar size={16} color="#94a3b8" />
            <Typography variant="caption" color="text.secondary">Member since {formatDate(user.createdAt)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: Receipt,     bg: "#e0e7ff", color: "#4338ca", label: "Redemptions",  value: user.redemptions.length },
          { icon: TrendingDown, bg: "#d1fae5", color: "#065f46", label: "Est. Savings", value: formatCurrency(totalSavings) },
          { icon: Crown,       bg: "#fef3c7", color: "#92400e", label: "Plan",          value: user.subscription ? user.subscription.plan.charAt(0) + user.subscription.plan.slice(1).toLowerCase() : "Free" },
        ].map(({ icon: Icon, bg, color, label, value }) => (
          <Grid size={{ xs: 12, sm: 4 }} key={label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
              {label === "Plan" && user.subscription && (
                <Typography variant="caption" color="text.secondary">Exp. {formatDate(user.subscription.endDate)}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Upgrade CTA */}
      {!isPaid && (
        <Paper sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg,#fffbeb,#fefce8)", border: "1px solid #fde68a", mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Crown size={18} color="#f59e0b" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Upgrade to Premium</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Unlock all offers and start saving at premium merchants.</Typography>
          </Box>
          <MuiButton component={Link} href="/subscribe" variant="contained" color="secondary" sx={{ borderRadius: "10px" }}>
            View Plans
          </MuiButton>
        </Paper>
      )}

      {/* Redemption history */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Redemption History</Typography>
      {user.redemptions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3, borderColor: "divider" }}>
          <Receipt size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
          <Typography variant="body2" color="text.secondary">No redemptions yet</Typography>
          {!isPaid && <Typography variant="caption" color="text.disabled">Subscribe to start redeeming exclusive offers</Typography>}
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
          {user.redemptions.map((r, i) => (
            <Box key={r.id}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", "&:hover": { bgcolor: "action.hover" } }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.offer.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{r.merchant.name}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>~{formatCurrency(r.savings)} saved</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDate(r.redeemedAt)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
