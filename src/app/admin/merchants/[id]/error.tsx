"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MerchantDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Merchant Detail Page Error:", error);
  }, [error]);

  return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 480, width: "100%", textAlign: "center", borderRadius: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#fee2e2", color: "#ef4444", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <AlertCircle size={24} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Merchant Details Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {error?.message || "We encountered an issue loading this merchant's information."}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <MuiButton component={Link} href="/admin/merchants" variant="outlined" startIcon={<ArrowLeft size={16} />}>
            Back to Merchants
          </MuiButton>
          <MuiButton variant="contained" onClick={() => reset()} startIcon={<RefreshCw size={16} />}>
            Retry
          </MuiButton>
        </Box>
      </Paper>
    </Box>
  );
}
