"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import { Check, Crown, Sparkles, ShieldCheck, Tag, AlertCircle } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SubscriptionPackage {
  id: number;
  titleEn: string;
  titleHr: string;
  priceMonthly: number;
  priceYearly: number;
  descriptionEn: string | null;
  isActive: boolean;
}

export default function SubscribePage() {
  const { data: session } = useSession();

  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load packages from database if available
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/subscription-packages");
        if (res.ok) {
          const data: SubscriptionPackage[] = await res.json();
          const activePkgs = data.filter((p) => p.isActive);
          if (activePkgs.length > 0) {
            setPackages(activePkgs);
            setSelectedPackageId(activePkgs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load subscription packages:", err);
      }
    }
    loadPackages();
  }, []);

  const activePackage = packages.find((p) => p.id === selectedPackageId);
  const currentPrice = activePackage
    ? selectedPlan === "MONTHLY"
      ? activePackage.priceMonthly
      : activePackage.priceYearly
    : selectedPlan === "MONTHLY"
    ? 9.99
    : 79.99;

  async function handleStripeCheckout() {
    setErrorMsg("");
    setLoading(true);

    const emailToUse = emailInput.trim() || session?.user?.email;

    if (!emailToUse) {
      setErrorMsg("Please provide your email address to continue with checkout.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          subscriptionPackageId: selectedPackageId,
          customerEmail: emailToUse,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL was not returned");
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1024, mx: "auto", px: 3, py: { xs: 4, sm: 6 } }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            boxShadow: "0 6px 20px rgba(245, 158, 11, 0.35)",
          }}
        >
          <Crown size={28} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Choose Your Membership
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600, mx: "auto" }}>
          Unlock exclusive dining offers, complimentary courses, and VIP perks across top venues
        </Typography>
      </Box>

      {/* Plan Billing Cycle Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 0.75,
            borderRadius: "9999px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
            display: "inline-flex",
            gap: 0.5,
          }}
        >
          <Button
            onClick={() => setSelectedPlan("MONTHLY")}
            variant={selectedPlan === "MONTHLY" ? "contained" : "text"}
            color={selectedPlan === "MONTHLY" ? "primary" : "inherit"}
            size="small"
            sx={{
              borderRadius: "9999px",
              px: 3,
              py: 1,
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            Monthly Billing
          </Button>

          <Button
            onClick={() => setSelectedPlan("ANNUAL")}
            variant={selectedPlan === "ANNUAL" ? "contained" : "text"}
            color={selectedPlan === "ANNUAL" ? "primary" : "inherit"}
            size="small"
            sx={{
              borderRadius: "9999px",
              px: 3,
              py: 1,
              fontWeight: 700,
              fontSize: "0.875rem",
              gap: 1,
            }}
          >
            <span>Annual Billing</span>
            <Chip
              label="Save 33%"
              size="small"
              sx={{
                bgcolor: selectedPlan === "ANNUAL" ? "#fbbf24" : "success.main",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          </Button>
        </Paper>
      </Box>

      {/* Packages / Plans Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {packages.length > 0 ? (
          packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const price = selectedPlan === "MONTHLY" ? pkg.priceMonthly : pkg.priceYearly;
            const isRecommended = packages.length > 1 ? pkg.id === packages[1]?.id : true;

            return (
              <Grid size={{ xs: 12, md: 4 }} key={pkg.id}>
                <Paper
                  onClick={() => setSelectedPackageId(pkg.id)}
                  elevation={isSelected ? 4 : 0}
                  variant={isSelected ? "elevation" : "outlined"}
                  sx={{
                    p: 3.5,
                    borderRadius: "20px",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected ? "action.selected" : "background.paper",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  {isRecommended && (
                    <Box sx={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                      <Chip
                        label="Recommended"
                        color="secondary"
                        size="small"
                        sx={{ fontWeight: 800, fontSize: "0.75rem", px: 1 }}
                      />
                    </Box>
                  )}

                  <Box>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "text.disabled",
                        bgcolor: isSelected ? "primary.main" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                      }}
                    >
                      {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ffffff" }} />}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {pkg.titleEn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {pkg.descriptionEn || "Full VIP Dining Access"}
                    </Typography>

                    <Box sx={{ mt: 2.5, mb: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, display: "inline" }}>
                        {formatCurrency(price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                        / {selectedPlan === "MONTHLY" ? "month" : "year"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ pt: 2.5, borderTop: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {["Unlimited restaurant redemptions", "Digital VIP member pass", "Cancel or switch anytime"].map((feature) => (
                      <Box key={feature} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Check size={16} color="#10b981" />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })
        ) : (
          SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={plan.id}>
                <Paper
                  onClick={() => setSelectedPlan(plan.id as "MONTHLY" | "ANNUAL")}
                  elevation={isSelected ? 4 : 0}
                  variant={isSelected ? "elevation" : "outlined"}
                  sx={{
                    p: 3.5,
                    borderRadius: "20px",
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected ? "action.selected" : "background.paper",
                    position: "relative",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", transform: "translateY(-4px)" },
                  }}
                >
                  {plan.recommended && (
                    <Box sx={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                      <Chip label="Best Value" color="secondary" size="small" sx={{ fontWeight: 800 }} />
                    </Box>
                  )}

                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: isSelected ? "primary.main" : "text.disabled",
                      bgcolor: isSelected ? "primary.main" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                    }}
                  >
                    {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ffffff" }} />}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{plan.description}</Typography>

                  <Box sx={{ mt: 2.5, mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, display: "inline" }}>
                      {formatCurrency(plan.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                      / {plan.period}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 2.5, borderTop: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {plan.features.map((f) => (
                      <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Check size={16} color="#10b981" />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* User Information & Promo Code Card */}
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 500,
          mx: "auto",
          p: 3.5,
          borderRadius: "20px",
          borderColor: "divider",
          mb: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {!session?.user?.email && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "block", mb: 1 }}>
              Account Email
            </Typography>
            <TextField
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              required
              fullWidth
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
              Your subscription membership will be linked to this email address.
            </Typography>
          </Box>
        )}

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Tag size={14} />
            Promo Code (Optional)
          </Typography>
          <TextField
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="e.g. VIP2026"
            fullWidth
            slotProps={{
              htmlInput: { style: { fontFamily: "monospace", textTransform: "uppercase" } },
            }}
          />
        </Box>

        {errorMsg && (
          <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}
      </Paper>

      {/* Submit Button & Security Footnote */}
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          disabled={loading}
          onClick={handleStripeCheckout}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 800,
            borderRadius: "14px",
            boxShadow: "0 6px 24px rgba(245, 158, 11, 0.4)",
          }}
        >
          {loading ? "Preparing Checkout..." : `Pay with Stripe — ${formatCurrency(currentPrice)}`}
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, color: "text.secondary", mt: 2.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ShieldCheck size={16} color="#10b981" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>256-bit Encrypted Checkout</Typography>
          </Box>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Powered by Stripe</Typography>
          <Typography variant="caption">•</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Cancel anytime</Typography>
        </Box>
      </Box>
    </Box>
  );
}
