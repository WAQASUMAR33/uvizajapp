"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscribeCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-md">
          <XCircle className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Checkout Not Completed
      </h1>
      <p className="text-slate-600 text-base mb-8 leading-relaxed">
        Your payment was not completed and you have not been charged. If you encountered an issue or wish to choose another payment method or plan, you can try again anytime.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/subscribe" className="w-full sm:w-auto">
          <Button variant="default" size="lg" className="w-full sm:w-auto px-6 py-3 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </Link>
        <Link href="/home" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-3 font-semibold">
            <HelpCircle className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
