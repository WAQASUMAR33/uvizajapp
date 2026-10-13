"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "40px 32px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "28px" }}>
          <img
            src="/uzivaj_logo.png"
            alt="Ujivaj Logo"
            style={{ height: "52px", width: "auto", margin: "0 auto", display: "inline-block" }}
          />
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e0e7ff",
              borderTopColor: "#4f46e5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }} />
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e1b4b", marginBottom: "8px" }}>
              Verifying Email
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              {message}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px",
              fontWeight: "bold"
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e1b4b", marginBottom: "12px" }}>
              Email Verified!
            </h2>
            <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
              Your email address has been verified. You can now open the Ujivaj mobile app and log into your account.
            </p>
            <div style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: "13px"
            }}>
              🎉 You are all set! Return to the app to start saving.
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px",
              fontWeight: "bold"
            }}>
              ✕
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e1b4b", marginBottom: "10px" }}>
              Verification Failed
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" }}>
              {message}
            </p>

            {/* Resend Form */}
            <div style={{
              borderTop: "1px solid #e2e8f0",
              paddingTop: "24px",
              textAlign: "left"
            }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                Request a new verification link:
              </p>
              <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  style={{
                    padding: "11px",
                    backgroundColor: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: resendLoading ? "not-allowed" : "pointer",
                    opacity: resendLoading ? 0.7 : 1
                  }}
                >
                  {resendLoading ? "Sending..." : "Resend Verification Link"}
                </button>
              </form>
              {resendStatus && (
                <p style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: resendStatus.includes("sent") ? "#16a34a" : "#dc2626",
                  textAlign: "center"
                }}>
                  {resendStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc"
      }}>
        <p style={{ color: "#64748b" }}>Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
