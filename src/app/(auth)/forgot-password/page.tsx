"use client";
import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Something went wrong");
    else setSent(true);
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 3 }}>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uzivaj_logo.png" alt="Ujivaj" style={{ height: 44, width: "auto", marginBottom: 32 }} />

        {sent ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.
            </Alert>
            <Button component={Link} href="/login" variant="outlined" fullWidth startIcon={<ArrowLeft size={16} />} sx={{ borderRadius: "10px", py: 1.25, textTransform: "none" }}>
              Back to sign in
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Forgot password?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter your email and we&apos;ll send you a reset link.
            </Typography>

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
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                sx={{ borderRadius: "10px", py: 1.5, fontWeight: 700, boxShadow: "0 4px 14px rgba(79,70,229,0.4)" }}
              >
                Send reset link
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button component={Link} href="/login" size="small" startIcon={<ArrowLeft size={14} />} sx={{ textTransform: "none", color: "text.secondary" }}>
                Back to sign in
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
