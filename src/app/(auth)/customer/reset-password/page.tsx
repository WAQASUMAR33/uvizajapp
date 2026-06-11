"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

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
      <Alert severity="error" sx={{ borderRadius: 2 }}>
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
      <Alert severity="success" sx={{ mb: 4, borderRadius: 2, textAlign: "left" }}>
        Password updated successfully! You can now log in to the <strong>Ujivaj</strong> mobile app.
      </Alert>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        You can close this tab and return to the application to log in.
      </Typography>
    </Box>
  ) : (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
        Reset Customer Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose a new password for your customer account: <strong>{email}</strong>.
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
          sx={{
            borderRadius: "10px",
            py: 1.5,
            fontWeight: 700,
            background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
            boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #4338ca 0%, #2e268f 100%)",
              boxShadow: "0 6px 20px rgba(79,70,229,0.5)",
            }
          }}
        >
          Reset Password
        </Button>
      </Box>
    </>
  );
}

export default function CustomerResetPasswordPage() {
  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
      p: 3
    }}>
      <Box sx={{
        width: "100%",
        maxWidth: 420,
        bgcolor: "background.paper",
        p: { xs: 4, sm: 5 },
        borderRadius: 4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid",
        borderColor: "divider",
      }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uzivaj_logo.png" alt="Ujivaj" style={{ height: 44, width: "auto" }} />
        </Box>
        <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}>
          <CustomerResetPasswordForm />
        </Suspense>
      </Box>
    </Box>
  );
}
