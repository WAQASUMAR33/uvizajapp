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
import { Sparkles, Mail, Lock, User, ArrowRight, Crown, Eye, EyeOff, CheckCircle2 } from "lucide-react";

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
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* ── Left branded panel ── */}
      <Box sx={{
        display: { xs: "none", lg: "flex" },
        width: "52%",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 6,
        background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {[
          { top: -80, right: -80, w: 320, color: "rgba(139,92,246,0.2)" },
          { top: "33%", left: -64, w: 288, color: "rgba(99,102,241,0.15)" },
          { bottom: -96, right: "25%", w: 320, color: "rgba(245,158,11,0.1)" },
        ].map((b, i) => (
          <Box key={i} sx={{ position: "absolute", width: b.w, height: b.w, borderRadius: "50%", bgcolor: b.color, filter: "blur(48px)", top: (b as any).top, left: (b as any).left, right: (b as any).right, bottom: (b as any).bottom }} />
        ))}

        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg,#f59e0b,#eab308)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(245,158,11,0.35)" }}>
            <Sparkles size={20} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Ujivaj</Typography>
        </Box>

        <Box sx={{ position: "relative" }}>
          <Chip label="Free to Join" icon={<Crown size={12} />} size="small" sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)", color: "#fbbf24", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 600 }} />
          <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.15, mb: 2 }}>
            Start saving<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              today.
            </Box>
          </Typography>
          <Typography sx={{ color: "#a5b4fc", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: 360, mb: 4 }}>
            Create your free account and unlock exclusive dining deals at premium spots near you.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {PERKS.map((perk) => (
              <Box key={perk} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <CheckCircle2 size={18} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ color: "#c7d2fe", fontSize: "0.875rem" }}>{perk}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            {STATS.map(({ value, label }) => (
              <Paper key={label} sx={{ p: 2, textAlign: "center", bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
                <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>{value}</Typography>
                <Typography sx={{ color: "#818cf8", fontSize: "0.75rem", mt: 0.5 }}>{label}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        <Typography sx={{ position: "relative", color: "#4338ca", fontSize: "0.75rem" }}>
          © 2026 Ujivaj. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right form panel ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 }, bgcolor: "background.default" }}>
        <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#f59e0b,#eab308)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Ujivaj</Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Free forever. No credit card required.</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment> } }}
            />
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> } }}
            />
            <Box>
              <TextField
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                slotProps={{ input: {
                  startAdornment: <InputAdornment position="start"><Lock size={16} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end" tabIndex={-1}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }, htmlInput: { minLength: 8 } }}
              />
              {password.length > 0 && (
                <LinearProgress variant="determinate" value={pwStrength} color={pwColor as any} sx={{ mt: 1, borderRadius: 2, height: 4 }} />
              )}
            </Box>

            <MuiButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
              sx={{ borderRadius: "10px", py: 1.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(79,70,229,0.4)" }}
            >
              Create free account
            </MuiButton>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2.5, lineHeight: 1.6 }}>
            By creating an account you agree to our{" "}
            <Box component="span" sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Terms</Box>
            {" "}and{" "}
            <Box component="span" sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Privacy Policy</Box>.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
            Already have an account?{" "}
            <Box component={Link} href="/login" sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Sign in
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
