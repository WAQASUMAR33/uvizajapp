"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

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
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Invalid reset link. Please request a new one.
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
    <Box>
      <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
        Password updated! Redirecting to sign in…
      </Alert>
      <Button component={Link} href="/login" variant="outlined" fullWidth startIcon={<ArrowLeft size={16} />} sx={{ borderRadius: "10px", py: 1.25, textTransform: "none" }}>
        Sign in now
      </Button>
    </Box>
  ) : (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Set new password</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose a new password for <strong>{email}</strong>.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField
          label="New password"
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
        <TextField
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          fullWidth
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock size={16} /></InputAdornment> } }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !password || !confirm}
          endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
          sx={{ borderRadius: "10px", py: 1.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(79,70,229,0.4)" }}
        >
          Reset password
        </Button>
      </Box>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 3 }}>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uzivaj_logo.png" alt="Ujivaj" style={{ height: 44, width: "auto", marginBottom: 32 }} />
        <Suspense fallback={<CircularProgress />}>
          <ResetPasswordForm />
        </Suspense>
      </Box>
    </Box>
  );
}
