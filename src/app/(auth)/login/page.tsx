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
import CircularProgress from "@mui/material/CircularProgress";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Login</Typography>
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

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <MuiButton component={Link} href="/forgot-password" size="small" sx={{ textTransform: "none", color: "text.secondary", p: 0, minWidth: 0, fontSize: "0.8125rem" }}>
                Forgot password?
              </MuiButton>
            </Box>

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
        </Box>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
