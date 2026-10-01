"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Crown, Sparkles, ShieldCheck, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        // Redirect to Stripe's secure hosted Checkout page
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Choose Your Membership</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Unlock exclusive dining offers, complimentary courses, and VIP perks across top venues
        </p>
      </div>

      {/* Plan Billing Cycle Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex items-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedPlan("MONTHLY")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedPlan === "MONTHLY"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan("ANNUAL")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              selectedPlan === "ANNUAL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                selectedPlan === "ANNUAL" ? "bg-amber-400 text-slate-900" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Packages / Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {packages.length > 0 ? (
          packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const price = selectedPlan === "MONTHLY" ? pkg.priceMonthly : pkg.priceYearly;
            const isRecommended = packages.length > 1 ? pkg.id === packages[1]?.id : true;

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`relative text-left rounded-3xl border-2 p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/60 shadow-lg shadow-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Recommended
                    </span>
                  </div>
                )}

                <div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 mb-4 flex items-center justify-center ${
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xl">{pkg.titleEn}</h3>
                  <p className="text-slate-500 text-sm mt-1">{pkg.descriptionEn || "Full VIP access"}</p>

                  <div className="mt-4 mb-5">
                    <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(price)}</span>
                    <span className="text-slate-400 text-sm ml-1">
                      / {selectedPlan === "MONTHLY" ? "month" : "year"}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Unlimited merchant redemptions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Digital VIP member pass</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Cancel or switch anytime</span>
                  </li>
                </ul>
              </button>
            );
          })
        ) : (
          SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id as "MONTHLY" | "ANNUAL")}
                className={`relative text-left rounded-3xl border-2 p-6 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Best Value
                    </span>
                  </div>
                )}

                <div
                  className={`w-4 h-4 rounded-full border-2 mb-4 flex items-center justify-center ${
                    isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <h3 className="font-bold text-slate-900 text-xl">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{plan.description}</p>

                <div className="mt-4 mb-5">
                  <span className="text-3xl font-bold text-slate-900">{formatCurrency(plan.price)}</span>
                  <span className="text-slate-400 text-sm ml-1">/ {plan.period}</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })
        )}
      </div>

      {/* User Information & Promo Code Section */}
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 space-y-4">
        {!session?.user?.email && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Your subscription will be linked to this email address.</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            Promo Code (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER50"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase tracking-wider font-mono"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Submit Button & Badges */}
      <div className="text-center">
        <Button
          variant="gold"
          size="lg"
          loading={loading}
          onClick={handleStripeCheckout}
          className="px-12 py-3.5 text-base font-semibold shadow-md"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Pay with Stripe — {formatCurrency(currentPrice)}
        </Button>

        <div className="flex items-center justify-center gap-4 text-slate-400 text-xs mt-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            256-bit Encrypted Checkout
          </span>
          <span>•</span>
          <span>Powered by Stripe</span>
          <span>•</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
