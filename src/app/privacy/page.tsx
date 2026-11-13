"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, Trash2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-blue-600 tracking-tight">
              Uživaj
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Privacy Policy & Account Deletion
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Last updated: November 2026 · App: Uživaj (com.uzivaj.app)
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">1. Overview</h2>
              <p>
                <strong>Uživaj</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This policy explains what information we collect, how it is used, and how you can request the deletion of your account and associated personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register.</li>
                <li><strong>Location Data:</strong> Approximate and precise location, used strictly to display nearby restaurant partners and local offers.</li>
                <li><strong>Subscription & Transactions:</strong> Subscription tier and purchase records processed securely via Stripe. We do not store your credit card details.</li>
                <li><strong>Usage & Diagnostics:</strong> Analytics and crash reports via Firebase to improve app performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">3. How Your Data is Used</h2>
              <p>
                Your data is used solely to provide and improve the Uživaj service, authenticate your account, verify voucher redemptions, and process your membership subscriptions. We never sell your personal data to third parties.
              </p>
            </section>

            <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 my-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-lg mb-2">
                <Trash2 className="w-5 h-5 text-amber-700" />
                <h3>4. Account & Data Deletion Request</h3>
              </div>
              <p className="text-amber-950 text-sm leading-relaxed mb-3">
                Users have the right to request the permanent deletion of their account and all associated personal data at any time.
              </p>
              <div className="text-sm text-slate-800 space-y-2">
                <p><strong>How to request account deletion:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>In-App:</strong> Go to <em>Profile → Account Settings → Delete Account</em>.</li>
                  <li>
                    <strong>Via Email:</strong> Send an email from your registered email address to{" "}
                    <a href="mailto:uzivaj@rapidtechpro.com" className="text-blue-600 font-semibold underline">
                      uzivaj@rapidtechpro.com
                    </a>{" "}
                    with the subject line &quot;Delete My Account&quot;.
                  </li>
                </ol>
                <p className="mt-3">
                  <strong>What data is deleted:</strong> Your account profile (name, email, phone number, login credentials), saved preferences, and redemption history are permanently deleted from our active database within 30 days of your request. Anonymized transaction records may be retained as required by financial and tax regulations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">5. Contact Us</h2>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>
                  For any privacy questions or data requests, contact us at:{" "}
                  <a href="mailto:uzivaj@rapidtechpro.com" className="text-blue-600 font-medium">
                    uzivaj@rapidtechpro.com
                  </a>
                </span>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

