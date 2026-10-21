"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";
  const email        = searchParams.get("email") ?? "";

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState("");

  if (!token || !email) {
    return (
      <Alert severity="error" sx={{ borderRadius: "12px" }}>
        Invalid or expired password reset link. Please request a new one.
      </Alert>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  return done ? (
    <Box sx={{ textAlign: "center" }}>
      <Alert severity="success" sx={{ mb: 3, borderRadius: "12px", textAlign: "left" }}>
        Password updated successfully! Redirecting you to sign in…
      </Alert>
      <Button
        component={Link}
        href="/login"
        variant="outlined"
        fullWidth
        startIcon={<ArrowLeft size={16} />}
        sx={{ borderRadius: "12px", py: 1.3, textTransform: "none", fontWeight: 600 }}
      >
        Sign in now
      </Button>
    </Box>
  ) : (
    <>
      <Box sx={{ mb: 3.5, textAlign: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: "action.selected",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <KeyRound size={24} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
          Set new password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Choose a secure new password for <strong>{email}</strong>.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
            New Password
          </Typography>
          <TextField
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            placeholder="••••••••••••"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock size={16} className="text-slate-400" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end" tabIndex={-1}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
            Confirm Password
          </Typography>
          <TextField
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
            placeholder="••••••••••••"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock size={16} className="text-slate-400" /></InputAdornment>,
              },
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !password || !confirm}
          endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
          sx={{ borderRadius: "12px", py: 1.4, fontWeight: 700 }}
        >
          {loading ? "Updating..." : "Reset Password"}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          component={Link}
          href="/login"
          size="small"
          startIcon={<ArrowLeft size={14} />}
          sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
        >
          Back to sign in
        </Button>
      </Box>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        p: 3,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <ThemeToggle variant="icon" />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 3,
              py: 1.5,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uzivaj_logo.png" alt="Ujivaj" style={{ height: 36, width: "auto" }} />
          </Box>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}>
            <ResetPasswordForm />
          </Suspense>
        </Paper>
      </Box>
    </Box>
  );
}
