"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useColorMode } from "@/components/ThemeRegistry";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Store,
  Utensils,
  Receipt,
  CreditCard,
} from "lucide-react";

const platformHighlights = [
  {
    icon: <Utensils size={18} />,
    title: "Restaurant & Offer Listings",
    description: "Manage venue profiles, dining discounts, and seasonal menu promotions across partner locations.",
  },
  {
    icon: <Receipt size={18} />,
    title: "Table Voucher Redemptions",
    description: "Verify active subscriber vouchers and record diner savings directly at the venue during checkout.",
  },
  {
    icon: <CreditCard size={18} />,
    title: "Dining Club Memberships",
    description: "Monitor active monthly and annual subscriber passes, customer reviews, and partner performance.",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  const [portalType, setPortalType] = useState<"admin" | "merchant">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials. Please verify your email and password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("An unexpected error occurred during sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* ======================================================== */}
      {/* LEFT COLUMN: Uživaj Dining Club Partner Showcase        */}
      {/* ======================================================== */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: { lg: "48%", xl: "50%" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { lg: 5, xl: 7 },
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "divider",
          background: isDark
            ? "radial-gradient(ellipse at 15% 15%, rgba(99, 102, 241, 0.16) 0%, transparent 60%), linear-gradient(180deg, #091325 0%, #0b0f19 100%)"
            : "radial-gradient(ellipse at 15% 15%, rgba(99, 102, 241, 0.1) 0%, transparent 60%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)",
        }}
      >
        {/* Soft Background Radial Lighting */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 380,
            height: 380,
            borderRadius: "50%",
            bgcolor: isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(79, 70, 229, 0.08)",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />

        {/* Brand Header */}
        <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box
            component={Link}
            href="/home"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 2.25,
              py: 0.9,
              borderRadius: 0,
              background: "linear-gradient(135deg, #091e42 0%, #0a2550 100%)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uzivaj_logo.png"
              alt="Uživaj Logo"
              style={{ height: 30, width: "auto", objectFit: "contain" }}
            />
          </Box>

          <Chip
            label="Dining Privileges Network"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              bgcolor: isDark ? "rgba(99, 102, 241, 0.14)" : "rgba(79, 70, 229, 0.08)",
              color: isDark ? "primary.light" : "primary.main",
              border: "1px solid",
              borderColor: isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.18)",
              borderRadius: 0,
            }}
          />
        </Box>

        {/* Main Operational Overview */}
        <Box sx={{ position: "relative", zIndex: 2, my: "auto", py: 4, maxWidth: 540 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { lg: "2.35rem", xl: "2.75rem" },
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
              mb: 1.5,
            }}
          >
            Partner & Staff Portal
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1rem", lineHeight: 1.65, mb: 3.5 }}
          >
            The operational management hub for Uživaj partner restaurants, cafes, and administrative staff.
          </Typography>

          {/* Three Domain Highlight Cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {platformHighlights.map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 0,
                  bgcolor: isDark ? "rgba(17, 24, 39, 0.65)" : "rgba(255, 255, 255, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 0,
                    bgcolor: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.08)",
                    color: isDark ? "primary.light" : "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.25, display: "block", lineHeight: 1.5, fontSize: "0.8rem" }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Material Design Authentication Form        */}
      {/* ======================================================== */}
      <Box
        sx={{
          width: { xs: "100%", lg: "52%", xl: "50%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          p: { xs: 3, sm: 5, md: 6, lg: 5, xl: 7 },
          position: "relative",
          bgcolor: isDark ? "#0d1322" : "#f8fafc",
        }}
      >
        {/* Top Bar with Mobile Logo & Theme Switcher */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: { xs: 3, lg: 0 },
          }}
        >
          {/* Mobile Logo Branding (visible on small screens) */}
          <Box
            component={Link}
            href="/home"
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              alignItems: "center",
              px: 2,
              py: 0.75,
              borderRadius: 0,
              background: "linear-gradient(135deg, #091e42 0%, #0a2550 100%)",
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uzivaj_logo.png"
              alt="Uživaj Logo"
              style={{ height: 26, width: "auto" }}
            />
          </Box>

          <Box sx={{ ml: "auto" }}>
            <ThemeToggle variant="pill" size="small" sx={{ borderRadius: 0 }} />
          </Box>
        </Box>

        {/* Center Card */}
        <Box sx={{ width: "100%", maxWidth: 440, my: "auto" }}>
          <Paper
            elevation={isDark ? 4 : 1}
            sx={{
              p: { xs: 3.5, sm: 4.5 },
              borderRadius: 0,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
              bgcolor: "background.paper",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Brand Accent Line */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: "primary.main",
              }}
            />

            {/* Role Tabs */}
            <Box sx={{ mb: 3.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Tabs
                value={portalType}
                onChange={(_, val) => setPortalType(val)}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    py: 1.25,
                    gap: 1,
                  },
                }}
              >
                <Tab
                  value="admin"
                  icon={<ShieldCheck size={18} />}
                  iconPosition="start"
                  label="Admin Portal"
                />
                <Tab
                  value="merchant"
                  icon={<Store size={18} />}
                  iconPosition="start"
                  label="Venue Partner"
                />
              </Tabs>
            </Box>

            {/* Header Title */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
                {portalType === "admin" ? "Staff Sign In" : "Partner Sign In"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {portalType === "admin"
                  ? "Access system analytics, merchant partners, and subscriber management."
                  : "Access your restaurant profile, active offers, and redemption records."}
              </Typography>
            </Box>

            {/* Error Feedback */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 0,
                  border: "1px solid",
                  borderColor: "error.main",
                }}
              >
                {error}
              </Alert>
            )}

            {/* Material Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Outlined TextField with Floating Notched Label */}
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                fullWidth
                autoComplete="email"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={19} color={isDark ? "#818cf8" : "#4f46e5"} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                  },
                }}
              />

              {/* Password Field with Floating Notched Label & Visibility Toggle */}
              <Box>
                <TextField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  fullWidth
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={19} color={isDark ? "#818cf8" : "#4f46e5"} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPass(!showPass)}
                            edge="end"
                            size="small"
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            {showPass ? <EyeOff size={19} /> : <Eye size={19} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 0,
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.75 }}>
                  <Typography
                    component={Link}
                    href="/forgot-password"
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Forgot your password?
                  </Typography>
                </Box>
              </Box>

              {/* Keep Signed In Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem", userSelect: "none" }}>
                    Keep me signed in
                  </Typography>
                }
              />

              {/* Material UI Elevated Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowRight size={18} />
                  )
                }
                sx={{
                  py: 1.4,
                  borderRadius: 0,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  background: isDark
                    ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  boxShadow: isDark
                    ? "0 4px 18px rgba(99, 102, 241, 0.4)"
                    : "0 6px 18px rgba(79, 70, 229, 0.35)",
                  "&:hover": {
                    background: isDark
                      ? "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)"
                      : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    boxShadow: "0 8px 22px rgba(79, 70, 229, 0.45)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right Bottom Footer */}
        <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 500 }}>
            © {new Date().getFullYear()} Uživaj. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

