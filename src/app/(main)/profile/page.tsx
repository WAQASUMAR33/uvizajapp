import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MuiButton from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar, Settings, ShieldCheck, Palette, Store, Crown } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <Box sx={{ maxWidth: 840, mx: "auto", px: 3, py: { xs: 4, sm: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Account & Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal details, credentials, and app preferences.
        </Typography>
      </Box>

      {/* Main Profile Info Card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: "20px",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                fontSize: "1.75rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#ffffff",
                borderRadius: "18px",
                boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
              }}
            >
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {user.name || "Administrator"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<ShieldCheck size={14} />}
                  label={user.role || "Admin"}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, borderRadius: "9999px" }}
                />
                <Chip
                  label="Active Account"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700, borderRadius: "9999px" }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              borderRadius: "9999px",
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Calendar size={15} color="#94a3b8" />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Member since {formatDate(user.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Preferences & Appearance Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: "20px",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "action.selected",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Palette size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Theme Appearance
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Toggle between light and dark modes according to your preference or lighting conditions.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Current Mode
              </Typography>
              <ThemeToggle variant="pill" size="medium" />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3.5,
              borderRadius: "20px",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "action.selected",
                    color: "secondary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Crown size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  VIP Privileges
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Access special partner venues, exclusive course discounts, and unlimited member redemptions.
              </Typography>
            </Box>

            <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <MuiButton
                component={Link}
                href="/subscribe"
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ borderRadius: "10px", fontWeight: 700 }}
              >
                View Membership Plans
              </MuiButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Navigation Actions */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <MuiButton
          component={Link}
          href="/admin"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Settings size={18} />}
          sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 700 }}
        >
          Go to Admin Portal
        </MuiButton>

        <MuiButton
          component={Link}
          href="/merchants"
          variant="outlined"
          size="large"
          startIcon={<Store size={18} />}
          sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 600 }}
        >
          Explore Venues
        </MuiButton>
      </Box>
    </Box>
  );
}
