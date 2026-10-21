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
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          boxShadow: 1,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: 4,
            borderColor: "primary.main",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "action.selected",
                  color: "primary.main",
                  borderRadius: "10px",
                }}
              >
                <Percent size={18} />
              </Avatar>
              <Chip
                label={offer.discountEn || offer.discountHr || "Special Offer"}
                size="small"
                color="secondary"
                sx={{ fontWeight: 800, fontSize: "0.75rem" }}
              />
            </Box>
          </Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 800 }}>
            {offer.titleEn || offer.titleHr}
          </Typography>
          {(offer.descriptionEn || offer.descriptionHr) && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1,
              }}
            >
              {offer.descriptionEn || offer.descriptionHr}
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
              <Avatar sx={{ width: 64, height: 64, bgcolor: "action.selected", color: "primary.main", borderRadius: "16px" }}>
                <Percent size={32} />
              </Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{offer.titleEn || offer.titleHr}</Typography>
                {merchantName && <Typography variant="body2" color="text.secondary">at {merchantName}</Typography>}
              </Box>
              {(offer.discountEn || offer.discountHr) && (
                <Chip label={offer.discountEn || offer.discountHr} color="secondary" sx={{ fontWeight: 800, fontSize: "0.875rem", px: 1, py: 2 }} />
              )}
              {(offer.descriptionEn || offer.descriptionHr) && <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>{offer.descriptionEn || offer.descriptionHr}</Typography>}
              {(offer.termsEn || offer.termsHr) && (
                <Box sx={{ bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: "12px", p: 2, width: "100%" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Terms & Conditions</Typography>
                  <Typography variant="caption" color="text.secondary">{offer.termsEn || offer.termsHr}</Typography>
                </Box>
              )}
              <MuiButton variant="contained" color="primary" fullWidth size="large" onClick={handleRedeem} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined} sx={{ borderRadius: "12px", py: 1.3, mt: 1, fontWeight: 700 }}>
                Confirm Redemption
              </MuiButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: "action.selected", color: "secondary.main", borderRadius: "16px" }}>
                <Lock size={32} />
              </Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Unlock This Offer</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Subscribe to Ujivaj to redeem exclusive offers at premium merchants.</Typography>
              </Box>
              <MuiButton variant="contained" color="secondary" fullWidth size="large" onClick={() => { setOpen(false); window.location.href = "/subscribe"; }} sx={{ borderRadius: "12px", py: 1.3, fontWeight: 700 }}>
                View Membership Plans
              </MuiButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
