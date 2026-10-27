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
  ShieldCheck,
  Store,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

const adminHighlights = [
  {
    icon: <BarChart3 size={18} />,
    title: "Real-Time Platform Analytics",
    description: "Monitor customer voucher redemptions, monthly subscriber trends, and merchant partner volumes.",
  },
  {
    icon: <Users size={18} />,
    title: "Subscriber & Partner Management",
    description: "Oversee dining pass holders, verify partner listings, and manage promotional category tags.",
  },
  {
    icon: <Settings size={18} />,
    title: "Terms, Legal & Platform Governance",
    description: "Publish dual-language terms of service, manage promo codes, and configure staff permission tiers.",
  },
];

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  // If redirected with ?type=merchant, automatically push to /merchant/login
  useEffect(() => {
    if (searchParams.get("type") === "merchant") {
      router.replace("/merchant/login");
    }
  }, [searchParams, router]);

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
        setError("Invalid credentials. Please verify your administrative email and password.");
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
      {/* LEFT COLUMN: Uživaj Admin & Staff Showcase               */}
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
            icon={<ShieldCheck size={14} />}
            label="Admin & Staff Portal"
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
            Administrator Control Center
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1rem", lineHeight: 1.65, mb: 3.5 }}
          >
            Secure, centralized administrative command for platform operations, financial auditing, partner approvals, and terms management.
          </Typography>

          {/* Highlights List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            {adminHighlights.map((feat, idx) => (
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
                    bgcolor: isDark ? "rgba(99, 102, 241, 0.18)" : "rgba(79, 70, 229, 0.1)",
                    color: isDark ? "primary.light" : "primary.main",
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

        {/* Footer info */}
        <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} Uživaj Platform Operations. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Link
              href="/admin/terms"
              style={{
                fontSize: "0.8rem",
                color: isDark ? "#94a3b8" : "#64748b",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Dedicated Admin Login Form                 */}
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
                bgcolor: "primary.main",
              }}
            />

            {/* Portal Badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Chip
                icon={<ShieldCheck size={14} color="#6366f1" />}
                label="Admin & Staff Access"
                size="small"
                sx={{
                  borderRadius: 0,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  bgcolor: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.08)",
                  color: isDark ? "primary.light" : "primary.main",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.18)",
                }}
              />
            </Box>

            {/* Header Title */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
                Administrator Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Enter your staff credentials to access the administrative control dashboard.
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

            {/* Admin Sign In Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Staff Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@uzivaj.hr"
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
                      sx={{ borderRadius: 0 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      Remember session
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
                    color: "primary.main",
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
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Admin Portal"}
              </Button>
            </Box>

            {/* Switch to Merchant Login */}
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
                Looking for your restaurant or venue account?
              </Typography>
              <Box
                component={Link}
                href="/merchant/login"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#d97706",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <Store size={16} />
                <span>Go to Venue Partner Login →</span>
              </Box>
            </Box>
          </Paper>
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
          <CircularProgress size={36} />
        </Box>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
