import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { AppTopProgressBar } from "@/components/common/AppTopProgressBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ujivaj — Exclusive Dining Offers",
  description: "Unlock exclusive dining offers at premium restaurants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <ThemeRegistry>
          <SessionProvider>
            <Suspense fallback={null}>
              <AppTopProgressBar />
            </Suspense>
            {children}
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
