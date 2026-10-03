"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password. Please check your credentials and try again.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("An unexpected error occurred during sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800">
      {/* ======================================================== */}
      {/* LEFT COLUMN: Logo Branding Showcase (Light Theme)       */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/30 border-r border-slate-200 relative overflow-hidden">
        {/* Soft decorative background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 my-auto py-12">
          {/* Logo Container */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-md border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uzivaj_logo.png"
                alt="Ujivaj"
                className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
              />
            </div>
            <div className="h-6 w-px bg-slate-300 mx-1" />
            <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-600" />
              Partner & Admin Portal
            </span>
          </div>

          {/* Hero Branding Content */}
          <div className="mt-12 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.25]">
              Elevating dining experiences with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                seamless management.
              </span>
            </h1>
            <div className="w-16 h-1 rounded-full bg-amber-400 mt-6" />
          </div>
        </div>

        {/* Bottom Platform Status Pill */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-slate-600">Ujivaj Enterprise Platform v2.4</span>
          </div>
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck size={14} className="text-indigo-600" />
            SOC-2 Enterprise Security
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Login Form (Light Theme)                  */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between items-center p-6 sm:p-10 lg:p-12 bg-white relative">
        <div className="w-full max-w-[420px] my-auto">
          {/* Mobile Logo Branding (shown only on small screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-md border border-slate-800 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uzivaj_logo.png"
                alt="Ujivaj"
                className="h-9 w-auto object-contain"
              />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Partner & Admin Portal
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-[0_15px_35px_-10px_rgba(15,23,42,0.06)] relative overflow-hidden">
            {/* Top brand accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-600 to-indigo-500" />

            {/* Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <ShieldCheck size={14} className="text-indigo-600" />
                Staff & Partner Access
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Sign in with your administrative credentials
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm animate-in fade-in duration-200">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 text-xs sm:text-sm leading-snug">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@ujivaj.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in on this device</span>
                </label>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security footnote */}
            <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-xs text-center">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>256-bit SSL encrypted enterprise session</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-slate-500 mt-6">
          <p>© {new Date().getFullYear()} Ujivaj Inc. All rights reserved.</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Exclusive Dining Privileges & Partner Management Portal
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
