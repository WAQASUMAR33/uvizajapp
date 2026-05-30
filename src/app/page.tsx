"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/admin"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white tracking-tight">Ujivaj</h1>
          <p className="text-indigo-300 mt-2 text-lg">Exclusive Dining Offers</p>
        </div>
      </div>
      <div className="absolute bottom-16 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
      </div>
    </div>
  );
}
