"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MuiButton from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight,
  Crown, Utensils, MapPin, Star,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) setError("Invalid email or password. Please try again.");
    else router.push(callbackUrl);
  }

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
        {/* Decorative blobs */}
        {[
          { top: -80, left: -80, size: 320, color: "rgba(99,102,241,0.2)" },
          { top: "40%", right: -60, size: 260, color: "rgba(139,92,246,0.18)" },
          { bottom: -60, left: "33%", size: 240, color: "rgba(245,158,11,0.1)" },
        ].map((blob, i) => (
          <Box key={i} sx={{ position: "absolute", width: blob.size, height: blob.size, borderRadius: "50%", backgroundColor: blob.color, filter: "blur(48px)", top: blob.top, left: (blob as any).left, right: (blob as any).right, bottom: (blob as any).bottom }} />
        ))}

        {/* Logo */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg, #f59e0b, #eab308)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(245,158,11,0.35)" }}>
            <Sparkles size={20} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Ujivaj</Typography>
        </Box>

        {/* Hero copy */}
        <Box sx={{ position: "relative" }}>
          <Chip label="Members-Only Access" icon={<Crown size={12} />} size="small" sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.1)", color: "#fbbf24", border: "1px solid rgba(255,255,255,0.15)", fontWeight: 600 }} />
          <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.15, mb: 2 }}>
            Dine more.<br />
            <Box component="span" sx={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Spend less.
            </Box>
          </Typography>
          <Typography sx={{ color: "#a5b4fc", fontSize: "1.0625rem", lineHeight: 1.7, maxWidth: 360, mb: 4 }}>
            Unlock exclusive dining offers at premium restaurants, cafés, and bars near you.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {[
              { icon: Utensils, text: "Exclusive deals at 200+ restaurants" },
              { icon: MapPin,   text: "Discover offers near your location" },
              { icon: Star,     text: "Save up to 40% on every visit" },
            ].map(({ icon: Icon, text }) => (
              <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color="#fbbf24" />
                </Box>
                <Typography sx={{ color: "#c7d2fe", fontSize: "0.875rem" }}>{text}</Typography>
              </Box>
            ))}
          </Box>

          {/* Testimonial */}
          <Paper sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3 }}>
            <Box sx={{ display: "flex", gap: 0.25, mb: 1.5 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#fbbf24" color="#fbbf24" />)}
            </Box>
            <Typography sx={{ color: "#c7d2fe", fontSize: "0.8125rem", fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;Ujivaj paid for itself the first weekend. We saved on brunch and still had a great time.&rdquo;
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #eab308)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>S</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>Sara K.</Typography>
                <Typography sx={{ color: "#6366f1", fontSize: "0.7rem" }}>Annual Member</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Typography sx={{ position: "relative", color: "#4338ca", fontSize: "0.75rem" }}>
          © 2026 Ujivaj. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right form panel ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 }, bgcolor: "background.default" }}>
        {/* Mobile logo */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #eab308)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Ujivaj</Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Sign in to your account to continue</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> } }}
            />

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
              } }}
            />

            <MuiButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
              sx={{ borderRadius: "10px", py: 1.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(79,70,229,0.4)", "&:hover": { boxShadow: "0 6px 20px rgba(79,70,229,0.5)" } }}
            >
              Sign in
            </MuiButton>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>OR</Typography>
          </Divider>

          <MuiButton
            component={Link}
            href="/admin"
            variant="outlined"
            fullWidth
            sx={{ borderRadius: "10px", py: 1.25, color: "text.secondary", borderColor: "divider", "&:hover": { borderColor: "text.secondary" } }}
          >
            Continue as Guest
          </MuiButton>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", display: "flex" }}><Box sx={{ display: { xs: "none", lg: "block" }, width: "52%", background: "linear-gradient(145deg, #1e1b4b, #4c1d95)" }} /><Box sx={{ flex: 1, bgcolor: "background.default" }} /></Box>}>
      <LoginForm />
    </Suspense>
  );
}
