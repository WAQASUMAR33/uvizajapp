"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 3, py: { xs: 6, sm: 10 }, textAlign: "center" }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: "24px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(16, 185, 129, 0.12)",
              color: "success.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.25)",
            }}
          >
            <CheckCircle2 size={48} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: -4,
              right: -4,
              bgcolor: "secondary.main",
              color: "#ffffff",
              borderRadius: "50%",
              p: 0.75,
              display: "flex",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
            }}
          >
            <Sparkles size={16} />
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 1.5 }}>
          Welcome to VIP Membership!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
          Your payment has been processed successfully and your subscription is active. You now have full access to exclusive restaurant discounts and VIP perks.
        </Typography>

        {sessionId && (
          <Box
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textAlign: "left",
            }}
          >
            <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
              <strong>Receipt Ref:</strong> {sessionId.slice(0, 24)}...
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
          <Button
            component={Link}
            href="/merchants"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<UtensilsCrossed size={18} />}
            sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 700 }}
          >
            Explore Merchants
          </Button>
          <Button
            component={Link}
            href="/profile"
            variant="outlined"
            size="large"
            endIcon={<ArrowRight size={18} />}
            sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 600 }}
          >
            Go to Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
