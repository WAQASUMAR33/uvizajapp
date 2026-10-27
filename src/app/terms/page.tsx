"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Shield, Calendar, RefreshCw } from "lucide-react";

interface TermsData {
  contentEn: string | null;
  contentHr: string | null;
  updatedAt: string | null;
}

export default function PublicTermsPage() {
  const [data, setData] = useState<TermsData | null>(null);
  const [lang, setLang] = useState<"en" | "hr">("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/terms");
      if (!res.ok) throw new Error("Failed to load terms & conditions");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load terms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "";
    try {
      const dt = new Date(iso);
      return dt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const activeContent =
    lang === "en"
      ? data?.contentEn || "Terms and conditions are currently unavailable in English."
      : data?.contentHr || "Uvjeti i odredbe trenutno nisu dostupni na hrvatskom jeziku.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                lang === "en"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setLang("hr")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                lang === "hr"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇭🇷</span>
              <span>Hrvatski</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          {/* Title Area */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
              <Shield size={13} />
              <span>Legal Documentation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === "en" ? "Terms & Conditions" : "Uvjeti i odredbe"}
            </h1>

            {data?.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Calendar size={13} />
                <span>Last updated: {formatDate(data.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="animate-spin text-indigo-600" size={28} />
              <p className="text-sm font-medium">Loading terms and conditions…</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-slate-600">
              <p className="text-red-600 font-semibold mb-3">{error}</p>
              <button
                type="button"
                onClick={loadTerms}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <article
              className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed
                [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
                [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:mb-4 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5
                [&_li]:text-slate-700
                [&_strong]:font-bold [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: activeContent }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
