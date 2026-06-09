"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/admin"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uzivaj_logo.png" alt="Ujivaj" className="h-36 w-auto animate-pulse drop-shadow-2xl" />
        <p className="text-indigo-300 text-lg">Exclusive Dining Offers</p>
      </div>
      <div className="absolute bottom-16 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
      </div>
    </div>
  );
}
