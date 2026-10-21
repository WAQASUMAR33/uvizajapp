"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { XCircle, ArrowLeft, Store } from "lucide-react";

export default function SubscribeCancelPage() {
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
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(245, 158, 11, 0.12)",
            color: "warning.main",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: "0 4px 20px rgba(245, 158, 11, 0.2)",
          }}
        >
          <XCircle size={48} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 1.5 }}>
          Checkout Not Completed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
          Your payment was not completed and your card has not been charged. If you wish to choose another payment method or plan, you can restart checkout at any time.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
          <Button
            component={Link}
            href="/subscribe"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowLeft size={18} />}
            sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 700 }}
          >
            Back to Plans
          </Button>
          <Button
            component={Link}
            href="/merchants"
            variant="outlined"
            size="large"
            startIcon={<Store size={18} />}
            sx={{ borderRadius: "12px", py: 1.3, px: 3, fontWeight: 600 }}
          >
            Return to Explore
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
