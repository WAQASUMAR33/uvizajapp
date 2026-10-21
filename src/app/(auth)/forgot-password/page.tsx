"use client";
import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";

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
      {/* Top right theme toggle */}
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <ThemeToggle variant="icon" />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 440 }}>
        {/* Brand Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 3,
              py: 1.5,
              borderRadius: 0,
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
            borderRadius: 0,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {sent ? (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 0, textAlign: "left" }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. Please check your inbox.
              </Alert>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                fullWidth
                startIcon={<ArrowLeft size={16} />}
                sx={{ borderRadius: 0, py: 1.3, textTransform: "none", fontWeight: 600 }}
              >
                Back to sign in
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3.5, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0,
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
                  Forgot password?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Enter your email address and we&apos;ll send you instructions to reset your password.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
                    Email Address
                  </Typography>
                  <TextField
                    type="email"
                    placeholder="name@ujivaj.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                  sx={{ borderRadius: 0, py: 1.4, fontWeight: 700 }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  component={Link}
                  href="/login"
                  size="small"
                  startIcon={<ArrowLeft size={14} />}
                  sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600, borderRadius: 0 }}
                >
                  Back to sign in
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
