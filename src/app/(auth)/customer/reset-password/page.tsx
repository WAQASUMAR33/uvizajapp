"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Lock, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";

function CustomerResetPasswordForm() {
  const searchParams = useSearchParams();
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
        Invalid or expired reset link. Please request a new one from the Ujivaj mobile application.
      </Alert>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      setLoading(false);
      
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setDone(true);
    } catch {
      setLoading(false);
      setError("Failed to connect to the server. Please try again.");
    }
  }

  return done ? (
    <Box sx={{ textAlign: "center" }}>
      <Alert severity="success" sx={{ mb: 3, borderRadius: "12px", textAlign: "left" }}>
        Password updated successfully! You can now log in to the <strong>Ujivaj</strong> mobile app.
      </Alert>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        You may now safely close this browser window and open the Ujivaj mobile app to sign in.
      </Typography>
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
          Reset Customer Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Choose a new password for your account: <strong>{email}</strong>
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
            placeholder="At least 8 characters"
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
            placeholder="Re-enter your new password"
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
    </>
  );
}

export default function CustomerResetPasswordPage() {
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
            <CustomerResetPasswordForm />
          </Suspense>
        </Paper>
      </Box>
    </Box>
  );
}
