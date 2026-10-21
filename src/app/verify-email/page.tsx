"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CheckCircle2, XCircle, Mail, ArrowRight, Sparkles } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialStatus = searchParams.get("status");
  const initialMessage = searchParams.get("message");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    initialStatus === "success" ? "success" : initialStatus === "error" ? "error" : token ? "loading" : "error"
  );
  const [message, setMessage] = useState<string>(
    initialMessage || (token ? "Verifying your email address..." : "Invalid verification link. No token provided.")
  );

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (token && !initialStatus) {
      fetch("/api/customers/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success) {
            setStatus("success");
            setMessage("Your email address has been successfully verified! You can now log into your Ujivaj app.");
          } else {
            setStatus("error");
            setMessage(data.error || "The verification link is invalid or has expired.");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("Failed to verify email. Please check your connection and try again.");
        });
    }
  }, [token, initialStatus]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/customers/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("A new verification link has been sent to your email!");
      } else {
        setResendStatus(data.error || "Could not send verification email. Try again.");
      }
    } catch {
      setResendStatus("Network error while sending email.");
    } finally {
      setResendLoading(false);
    }
  };

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

      <Box sx={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
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
            p: { xs: 3.5, sm: 5 },
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          {/* Loading State */}
          {status === "loading" && (
            <Box sx={{ py: 3 }}>
              <CircularProgress size={48} color="primary" sx={{ mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Verifying Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
            </Box>
          )}

          {/* Success State */}
          {status === "success" && (
            <Box>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  bgcolor: "rgba(16, 185, 129, 0.12)",
                  color: "success.main",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                  boxShadow: "0 4px 18px rgba(16, 185, 129, 0.25)",
                }}
              >
                <CheckCircle2 size={40} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Your email address has been successfully verified. You can now open the Ujivaj mobile application and log into your account.
              </Typography>

              <Alert severity="success" icon={<Sparkles size={18} />} sx={{ borderRadius: "12px", textAlign: "left" }}>
                You are all set! Return to the Ujivaj app to start enjoying dining savings.
              </Alert>
            </Box>
          )}

          {/* Error State */}
          {status === "error" && (
            <Box>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  bgcolor: "rgba(239, 68, 68, 0.12)",
                  color: "error.main",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                  boxShadow: "0 4px 18px rgba(239, 68, 68, 0.25)",
                }}
              >
                <XCircle size={40} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Verification Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {message}
              </Typography>

              {/* Resend Form */}
              <Box sx={{ pt: 3, borderTop: "1px solid", borderColor: "divider", textAlign: "left" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1.5 }}>
                  Request a new verification link:
                </Typography>
                <Box component="form" onSubmit={handleResend} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: <Mail size={16} className="text-slate-400 mr-2" />,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={resendLoading}
                    endIcon={resendLoading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                    sx={{ borderRadius: "12px", py: 1.3, fontWeight: 700 }}
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Link"}
                  </Button>
                </Box>
                {resendStatus && (
                  <Alert
                    severity={resendStatus.includes("sent") ? "success" : "error"}
                    sx={{ mt: 2, borderRadius: "12px" }}
                  >
                    {resendStatus}
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
