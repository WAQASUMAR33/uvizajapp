"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-1.5 shadow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Welcome to VIP Membership!
      </h1>
      <p className="text-slate-600 text-base mb-6 leading-relaxed">
        Your payment has been processed successfully and your subscription is now active. You have full access to exclusive perks, merchant savings, and special offers.
      </p>

      {sessionId && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-left text-xs text-slate-500 break-all flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong className="text-slate-700">Receipt Ref:</strong> {sessionId.slice(0, 24)}...
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/merchants" className="w-full sm:w-auto">
          <Button variant="default" size="lg" className="w-full sm:w-auto px-6 py-3 font-semibold">
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Explore Merchants & Perks
          </Button>
        </Link>
        <Link href="/profile" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-3 font-semibold">
            Go to Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading your confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
