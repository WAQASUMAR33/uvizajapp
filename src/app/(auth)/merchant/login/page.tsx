"use client";

import { useState, useEffect, Suspense } from "react";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { useColorMode } from "@/components/ThemeRegistry";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Utensils,
  Receipt,
  Star,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const merchantHighlights = [
  {
    icon: <Utensils size={18} />,
    title: "Dining Deals & Seasonal Menus",
    description: "Launch buy-one-get-one promotions, tasting specials, and exclusive member dining discounts.",
  },
  {
    icon: <Receipt size={18} />,
    title: "Instant Voucher Verification",
    description: "Validate 4-digit guest redemption codes at tableside quickly and securely without extra hardware.",
  },
  {
    icon: <Star size={18} />,
    title: "Patron Ratings & Reviews",
    description: "View verified customer feedback, track dining trends, and measure promotional return on investment.",
  },
];

function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/merchants";
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Display error if redirected with error in URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError("Invalid credentials. Please verify your merchant email and password.");
    } else if (errorParam) {
      setError("Authentication failed: " + errorParam);
    }
  }, [searchParams]);

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

      if (!res || !res.ok || res.error) {
        setError("Invalid credentials. Please verify your merchant email and password.");
        setLoading(false);
        return;
      }

      // Hard navigation so newly set session cookies are cleanly recognized by Server Components
      window.location.href = callbackUrl;
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
      {/* LEFT COLUMN: Uživaj Venue Partner Showcase               */}
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
            ? "radial-gradient(ellipse at 15% 15%, rgba(245, 158, 11, 0.14) 0%, transparent 60%), linear-gradient(180deg, #110e05 0%, #0d1117 100%)"
            : "radial-gradient(ellipse at 15% 15%, rgba(245, 158, 11, 0.1) 0%, transparent 60%), linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #f8fafc 100%)",
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
            bgcolor: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.08)",
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
            icon={<Store size={14} />}
            label="Venue Partner Portal"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              bgcolor: isDark ? "rgba(245, 158, 11, 0.18)" : "rgba(217, 119, 6, 0.12)",
              color: isDark ? "#fbbf24" : "#b45309",
              border: "1px solid",
              borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(217, 119, 6, 0.25)",
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
            Restaurant & Venue Portal
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1rem", lineHeight: 1.65, mb: 3.5 }}
          >
            Welcome partner! Manage your restaurant listing, active subscriber promotions, and track tableside voucher redemptions in real time.
          </Typography>

          {/* Highlights List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            {merchantHighlights.map((feat, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2,
                  borderRadius: 0,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 0,
                    bgcolor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.15)",
                    color: isDark ? "#fbbf24" : "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  {feat.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.925rem", mb: 0.25 }}>
                    {feat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", lineHeight: 1.5 }}>
                    {feat.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Dedicated Merchant Login Form              */}
      {/* ======================================================== */}
      <Box
        sx={{
          flex: 1,
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
          {/* Mobile Logo Branding */}
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
                bgcolor: "#d97706",
              }}
            />

            {/* Portal Badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Chip
                icon={<Store size={14} color="#d97706" />}
                label="Merchant & Venue Portal"
                size="small"
                sx={{
                  borderRadius: 0,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  bgcolor: isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)",
                  color: isDark ? "#fbbf24" : "#b45309",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.2)",
                }}
              />
            </Box>

            {/* Header Title */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
                Partner Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Access your venue profile, active dining promotions, and table verification records.
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

            {/* Merchant Sign In Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Partner Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="venue@restaurant.com"
                required
                fullWidth
                autoComplete="email"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={19} color={isDark ? "#fbbf24" : "#d97706"} />
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
                        <Lock size={19} color={isDark ? "#fbbf24" : "#d97706"} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass(!showPass)}
                          edge="end"
                          aria-label="toggle password visibility"
                          size="small"
                        >
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
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

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ borderRadius: 0, color: "#d97706", "&.Mui-checked": { color: "#d97706" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      Remember venue
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Box
                  component={Link}
                  href="/forgot-password"
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#d97706",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot password?
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowRight size={18} />}
                sx={{
                  py: 1.4,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 0,
                  boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
                  bgcolor: "#d97706",
                  "&:hover": {
                    bgcolor: "#b45309",
                  },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Venue Portal"}
              </Button>
            </Box>

            {/* Switch to Admin Login */}
            <Box
              sx={{
                mt: 3.5,
                pt: 2.5,
                borderTop: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                Are you platform staff or an administrator?
              </Typography>
              <Box
                component={Link}
                href="/login"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ShieldCheck size={16} />
                <span>Go to Admin Portal Login →</span>
              </Box>
            </Box>
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}

export default function MerchantLoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress size={36} />
        </Box>
      }
    >
      <MerchantLoginForm />
    </Suspense>
  );
}
