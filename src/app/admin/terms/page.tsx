"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Columns,
  Smartphone,
  Monitor,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "indent",
  "blockquote",
  "link",
];

// Helper to calculate stats
function getHtmlStats(html: string) {
  if (!html) return { words: 0, characters: 0, readingTimeMinutes: 0 };
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const characters = text.length;
  const words = text ? text.split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, characters, readingTimeMinutes };
}

export default function TermsPage() {
  const [contentEn, setContentEn] = useState("");
  const [contentHr, setContentHr] = useState("");
  const [originalEn, setOriginalEn] = useState("");
  const [originalHr, setOriginalHr] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View modes: "SPLIT" | "EN_ONLY" | "HR_ONLY" | "PREVIEW"
  const [viewMode, setViewMode] = useState<"SPLIT" | "EN_ONLY" | "HR_ONLY" | "PREVIEW">("SPLIT");
  // Preview language and viewport:
  const [previewLang, setPreviewLang] = useState<"EN" | "HR">("EN");
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "MOBILE">("DESKTOP");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/terms")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          const en = data.contentEn ?? "";
          const hr = data.contentHr ?? "";
          setContentEn(en);
          setContentHr(hr);
          setOriginalEn(en);
          setOriginalHr(hr);
          setUpdatedAt(data.updatedAt ?? null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          setError("Failed to fetch current terms: " + msg);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/terms");
      const data = await res.json();
      const en = data.contentEn ?? "";
      const hr = data.contentHr ?? "";
      setContentEn(en);
      setContentHr(hr);
      setOriginalEn(en);
      setOriginalHr(hr);
      setUpdatedAt(data.updatedAt ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError("Failed to fetch current terms: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Check unsaved changes
  const hasChanges = useMemo(() => {
    return contentEn !== originalEn || contentHr !== originalHr;
  }, [contentEn, contentHr, originalEn, originalHr]);

  // Handle Save
  const handleSave = useCallback(async () => {
    if (saving || loading) return;
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/terms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentEn, contentHr }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save terms");
      }

      setOriginalEn(contentEn);
      setOriginalHr(contentHr);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save terms";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [contentEn, contentHr, saving, loading]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const statsEn = useMemo(() => getHtmlStats(contentEn), [contentEn]);
  const statsHr = useMemo(() => getHtmlStats(contentHr), [contentHr]);

  // Boilerplate section appenders
  const appendSection = (lang: "EN" | "HR", sectionTitle: string, sectionBody: string) => {
    const snippet = `<h3>${sectionTitle}</h3><p>${sectionBody}</p>`;
    if (lang === "EN") {
      setContentEn((prev) => (prev ? `${prev}<br/>${snippet}` : snippet));
    } else {
      setContentHr((prev) => (prev ? `${prev}<br/>${snippet}` : snippet));
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER SECTION                                        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Terms & Conditions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Legal Documents
            </span>
            {hasChanges && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage, edit, and publish platform terms in English and Croatian for mobile and web.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in fade-in duration-200">
              <CheckCircle2 size={15} />
              <span>Published successfully!</span>
            </div>
          )}

          <button
            onClick={handleReload}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Reload from server"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading || !hasChanges}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? "Saving…" : "Save Changes"}</span>
            <span className="hidden md:inline-block text-[10px] opacity-75 font-normal ml-1">
              (Ctrl+S)
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS & PUBLISHING STATUS BAR                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Publish Status</span>
            <BookOpen size={16} className="text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Live & Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {updatedAt
                ? `Updated ${new Date(updatedAt).toLocaleString()}`
                : "Not published yet"}
            </p>
          </div>
        </div>

        {/* English Document Stats */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>English Version</span>
            <span className="text-xs">🇬🇧</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-xl font-black text-slate-900">
              {statsEn.words.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">words</span>
            <span className="text-xs text-slate-400">· {statsEn.readingTimeMinutes}m read</span>
          </div>
        </div>

        {/* Croatian Document Stats */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Croatian Version</span>
            <span className="text-xs">🇭🇷</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-xl font-black text-slate-900">
              {statsHr.words.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">words</span>
            <span className="text-xs text-slate-400">· {statsHr.readingTimeMinutes}m read</span>
          </div>
        </div>

        {/* Fast Action Preview */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Customer View</span>
            <span className="text-[11px] text-slate-500 block">Test mobile & web layout</span>
          </div>
          <button
            onClick={() => setViewMode(viewMode === "PREVIEW" ? "SPLIT" : "PREVIEW")}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={14} />
            <span>{viewMode === "PREVIEW" ? "Back to Edit" : "Live Preview"}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/80 text-rose-800 text-xs font-medium flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TOOLBAR & VIEW MODE SELECTOR                          */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode("SPLIT")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
              viewMode === "SPLIT"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Columns size={14} />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode("EN_ONLY")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
              viewMode === "EN_ONLY"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🇬🇧 English</span>
          </button>

          <button
            onClick={() => setViewMode("HR_ONLY")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
              viewMode === "HR_ONLY"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🇭🇷 Croatian</span>
          </button>

          <button
            onClick={() => setViewMode("PREVIEW")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
              viewMode === "PREVIEW"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        </div>

        {/* Quick boilerplates dropdown or actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 hidden md:inline">Quick Insert:</span>
          <button
            onClick={() =>
              appendSection(
                viewMode === "HR_ONLY" ? "HR" : "EN",
                "Subscription & Auto-Renewal",
                "Memberships renew automatically every billing cycle unless cancelled before the renewal date through customer settings."
              )
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            + Subscription Clause
          </button>
          <button
            onClick={() =>
              appendSection(
                viewMode === "HR_ONLY" ? "HR" : "EN",
                "Offer Redemptions & Merchant Rules",
                "All partner deals are subject to merchant availability, one voucher per visit, and cannot be exchanged for cash."
              )
            }
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            + Deal Clause
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN EDITORS OR PREVIEW VIEW                          */}
      {/* ======================================================== */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading document content…</p>
        </div>
      ) : viewMode === "PREVIEW" ? (
        /* LIVE CUSTOMER PREVIEW MODE */
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 space-y-4">
          {/* Preview Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Language:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setPreviewLang("EN")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    previewLang === "EN"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setPreviewLang("HR")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    previewLang === "HR"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🇭🇷 Croatian
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Viewport:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setPreviewDevice("DESKTOP")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    previewDevice === "DESKTOP"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Monitor size={14} /> Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice("MOBILE")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                    previewDevice === "MOBILE"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone size={14} /> Mobile App
                </button>
              </div>
            </div>
          </div>

          {/* Device Frame */}
          <div className="flex justify-center p-4 bg-slate-50/50 rounded-2xl min-h-[500px]">
            {previewDevice === "MOBILE" ? (
              <div className="w-[375px] bg-white rounded-[36px] border-8 border-slate-800 shadow-xl overflow-hidden flex flex-col h-[680px]">
                {/* Mobile notch / header */}
                <div className="bg-slate-800 text-white py-2 px-6 flex justify-between items-center text-[10px] font-bold">
                  <span>9:41</span>
                  <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
                  <span>5G 100%</span>
                </div>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Terms & Conditions</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    {previewLang === "EN" ? "EN" : "HR"}
                  </span>
                </div>
                <div className="flex-1 p-5 overflow-y-auto prose prose-slate prose-sm text-xs">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        (previewLang === "EN" ? contentEn : contentHr) ||
                        "<p class='text-slate-400 italic'>No content written yet.</p>",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h2 className="text-2xl font-black text-slate-900">
                    Platform Terms and Conditions
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Last updated: {updatedAt ? new Date(updatedAt).toLocaleDateString() : "Draft"}
                  </p>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        (previewLang === "EN" ? contentEn : contentHr) ||
                        "<p class='text-slate-400 italic'>No content written yet.</p>",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDITING MODE (Split, EN Only, or HR Only) */
        <div
          className={`grid gap-6 ${
            viewMode === "SPLIT"
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 max-w-4xl mx-auto"
          }`}
        >
          {/* ENGLISH EDITOR */}
          {(viewMode === "SPLIT" || viewMode === "EN_ONLY") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇬🇧</span>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    English Terms & Conditions
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {statsEn.words} words · {statsEn.characters} chars
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-slate-50/80 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[500px] [&_.ql-editor]:text-slate-800 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
                <ReactQuill
                  theme="snow"
                  value={contentEn}
                  onChange={setContentEn}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Draft English terms & conditions here…"
                />
              </div>
            </div>
          )}

          {/* CROATIAN EDITOR */}
          {(viewMode === "SPLIT" || viewMode === "HR_ONLY") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇭🇷</span>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Croatian Terms & Conditions (Uvjeti korištenja)
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {statsHr.words} words · {statsHr.characters} chars
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-slate-50/80 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[500px] [&_.ql-editor]:text-slate-800 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
                <ReactQuill
                  theme="snow"
                  value={contentHr}
                  onChange={setContentHr}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Uredite hrvatske uvjete korištenja ovdje…"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
