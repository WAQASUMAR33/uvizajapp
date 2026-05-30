"use client";
import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { Percent, Lock, CheckCircle, X } from "lucide-react";
import type { SafeOffer } from "@/types";

interface OfferCardProps {
  offer: SafeOffer;
  userRole?: string;
  merchantName?: string;
}

export function OfferCard({ offer, userRole, merchantName }: OfferCardProps) {
  const [open, setOpen]         = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const canRedeem = userRole === "PAID_SUBSCRIBER" || userRole === "ADMIN";

  async function handleRedeem() {
    if (!canRedeem) return;
    setLoading(true);
    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });
      if (res.ok) setRedeemed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card sx={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", border: "1px solid #e0e7ff", borderRadius: 3, boxShadow: "none", transition: "all 0.2s", "&:hover": { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#4f46e5", borderRadius: 2 }}>
              <Percent size={18} />
            </Avatar>
            <Chip label={offer.discount || "Special Offer"} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.72rem" }} />
          </Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>{offer.title}</Typography>
          {offer.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 1 }}>
              {offer.description}
            </Typography>
          )}
          {offer.validUntil && (
            <Typography variant="caption" color="text.disabled">Valid until {new Date(offer.validUntil).toLocaleDateString()}</Typography>
          )}
          <Box sx={{ mt: 2 }}>
            {canRedeem ? (
              redeemed ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main" }}>
                  <CheckCircle size={16} /><Typography variant="body2" sx={{ fontWeight: 600 }}>Redeemed!</Typography>
                </Box>
              ) : (
                <MuiButton size="small" variant="contained" onClick={() => setOpen(true)} sx={{ borderRadius: "8px" }}>Redeem Offer</MuiButton>
              )
            ) : (
              <MuiButton size="small" variant="text" startIcon={<Lock size={14} />} onClick={() => setOpen(true)} sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                Subscribe to redeem
              </MuiButton>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "20px" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          {canRedeem ? "Redeem Offer" : "Subscription Required"}
          <IconButton size="small" onClick={() => setOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {canRedeem ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: "#e0e7ff", borderRadius: 3 }}><Percent size={32} color="#4f46e5" /></Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{offer.title}</Typography>
                {merchantName && <Typography variant="body2" color="text.secondary">at {merchantName}</Typography>}
              </Box>
              <Chip label={offer.discount} sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.875rem", px: 1, py: 2 }} />
              {offer.description && <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>{offer.description}</Typography>}
              {offer.terms && (
                <Box sx={{ bgcolor: "grey.50", borderRadius: 2, p: 2, width: "100%" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>Terms & Conditions</Typography>
                  <Typography variant="caption" color="text.secondary">{offer.terms}</Typography>
                </Box>
              )}
              <MuiButton variant="contained" fullWidth size="large" onClick={handleRedeem} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined} sx={{ borderRadius: "10px", mt: 1 }}>
                Confirm Redemption
              </MuiButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: "#fef3c7", borderRadius: 3 }}><Lock size={32} color="#f59e0b" /></Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Unlock This Offer</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Subscribe to Ujivaj to redeem exclusive offers at premium merchants.</Typography>
              </Box>
              <MuiButton variant="contained" color="secondary" fullWidth size="large" onClick={() => { setOpen(false); window.location.href = "/subscribe"; }} sx={{ borderRadius: "10px" }}>
                View Plans
              </MuiButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
