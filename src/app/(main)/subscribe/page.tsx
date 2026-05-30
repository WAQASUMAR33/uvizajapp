"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function SubscribePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("ANNUAL");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected, platform: "web" }),
    });

    if (res.status === 401) {
      router.push("/login?callbackUrl=/subscribe");
      return;
    }

    setLoading(false);
    if (res.ok) {
      router.push("/profile");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
        <p className="text-slate-500 mt-2 text-lg">Unlock exclusive dining offers at premium merchants</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`relative text-left rounded-3xl border-2 p-6 transition-all duration-200 cursor-pointer ${
              selected === plan.id
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

            <div className={`w-4 h-4 rounded-full border-2 mb-4 flex items-center justify-center ${selected === plan.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
              {selected === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
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
        ))}
      </div>

      <div className="text-center">
        <Button variant="gold" size="lg" loading={loading} onClick={handleSubscribe} className="px-12">
          <Sparkles className="w-5 h-5" />
          Subscribe — {formatCurrency(SUBSCRIPTION_PLANS.find((p) => p.id === selected)?.price ?? 0)}
        </Button>
        <p className="text-slate-400 text-xs mt-3">Secure payment. Cancel anytime.</p>
      </div>
    </div>
  );
}
