"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MuiButton from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useColorMode } from "@/components/ThemeRegistry";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Crown,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

const PERKS = [
  "Access exclusive deals at 200+ dining spots",
  "Save up to 40% on every restaurant visit",
  "Discover hidden gems near your location",
  "Cancel anytime — no commitment",
];

const STATS = [
  { value: "200+", label: "Restaurants" },
  { value: "40%",  label: "Avg. Savings" },
  { value: "5k+",  label: "Members" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/admin");
  }

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 33 : password.length < 8 ? 66 : 100;
  const pwColor    = pwStrength < 34 ? "error" : pwStrength < 67 ? "warning" : "success";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* ── Left branded panel ── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: { lg: "50%", xl: "54%" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { lg: 6, xl: 8 },
          background: isDark
            ? "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0b0f19 100%)"
            : "linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          position: "relative",
          overflow: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {[
          { top: -80, right: -80, w: 320, color: "rgba(139,92,246,0.2)" },
          { top: "33%", left: -64, w: 288, color: "rgba(99,102,241,0.15)" },
          { bottom: -96, right: "25%", w: 320, color: "rgba(245,158,11,0.12)" },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: b.w,
              height: b.w,
              borderRadius: "50%",
              bgcolor: b.color,
              filter: "blur(54px)",
              top: (b as any).top,
              left: (b as any).left,
              right: (b as any).right,
              bottom: (b as any).bottom,
              pointerEvents: "none",
            }}
          />
        ))}

        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uzivaj_logo.png" alt="Ujivaj" style={{ height: 36, width: "auto" }} />
          <Chip
            label="Membership"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.12)",
              color: "#fbbf24",
              border: "1px solid rgba(255,255,255,0.2)",
              fontWeight: 700,
            }}
          />
        </Box>

        <Box sx={{ position: "relative", my: "auto", py: 6 }}>
          <Chip
            label="Free to Join"
            icon={<Crown size={12} />}
            size="small"
            sx={{
              mb: 3,
              bgcolor: "rgba(255,255,255,0.1)",
              color: "#fbbf24",
              border: "1px solid rgba(255,255,255,0.18)",
              fontWeight: 700,
            }}
          />
          <Typography variant="h2" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.18, mb: 2 }}>
            Start saving <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              today.
            </Box>
          </Typography>
          <Typography sx={{ color: "#c7d2fe", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 400, mb: 4 }}>
            Create your free account and unlock exclusive dining privileges at premium establishments.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {PERKS.map((perk) => (
              <Box key={perk} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <CheckCircle2 size={18} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ color: "#e0e7ff", fontSize: "0.875rem", fontWeight: 500 }}>
                  {perk}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, maxWidth: 460 }}>
            {STATS.map(({ value, label }) => (
              <Paper
                key={label}
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "14px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>
                  {value}
                </Typography>
                <Typography sx={{ color: "#a5b4fc", fontSize: "0.75rem", mt: 0.5, fontWeight: 600 }}>
                  {label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Typography sx={{ position: "relative", color: "#818cf8", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Ujivaj Inc. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right form panel ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 3, sm: 6, lg: 8 },
          position: "relative",
        }}
      >
        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <ThemeToggle variant="icon" />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 420, my: "auto" }}>
          <Paper
            elevation={isDark ? 3 : 1}
            sx={{
              p: { xs: 3.5, sm: 4.5 },
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Free forever. No credit card required.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
                  Full Name
                </Typography>
                <TextField
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} className="text-slate-400" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
                  Email Address
                </Typography>
                <TextField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} className="text-slate-400" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} className="text-slate-400" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end" tabIndex={-1}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { minLength: 8 },
                  }}
                />
                {password.length > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={pwStrength}
                    color={pwColor as any}
                    sx={{ mt: 1, borderRadius: 2, height: 4 }}
                  />
                )}
              </Box>

              <MuiButton
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                sx={{ borderRadius: "12px", py: 1.4, fontWeight: 700 }}
              >
                {loading ? "Creating account..." : "Create free account"}
              </MuiButton>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2.5, lineHeight: 1.6 }}>
              By creating an account you agree to our{" "}
              <Box component={Link} href="/admin/terms" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600 }}>
                Terms & Privacy Policy
              </Box>
              .
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
              Already have an account?{" "}
              <Box
                component={Link}
                href="/login"
                sx={{ color: "primary.main", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Sign in
              </Box>
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Ujivaj Hospitality & Dining Network
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
