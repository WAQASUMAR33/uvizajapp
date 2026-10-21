"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";

export function AppTopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        // Incrementally slow down as progress approaches 90%
        const diff = Math.max(1, (90 - prev) * 0.15);
        return prev + diff;
      });
    }, 120);
  };

  const complete = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setProgress(100);

    resetTimerRef.current = setTimeout(() => {
      setVisible(false);
      resetTimerRef.current = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  };

  // When pathname or searchParams change, mark loading complete
  useEffect(() => {
    complete();
  }, [pathname, searchParams]);

  // Intercept all internal navigation link clicks & browser history popstate
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, new window, etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      // Check if same origin
      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (url.origin !== currentUrl.origin) return;

        // If target is exact same path + search, do nothing
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Internal navigation detected -> start progress bar
        start();
      } catch {
        // invalid URL, ignore
      }
    };

    const handlePopState = () => {
      start();
    };

    const handleCustomStart = () => start();
    const handleCustomStop = () => complete();

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("app:loading:start", handleCustomStart);
    window.addEventListener("app:loading:stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("app:loading:start", handleCustomStart);
      window.removeEventListener("app:loading:stop", handleCustomStop);
      if (timerRef.current) clearInterval(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 999999,
        pointerEvents: "none",
        bgcolor: "transparent",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-in-out",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 35%, #0ea5e9 70%, #10b981 100%)",
          boxShadow: "0 0 12px rgba(99, 102, 241, 0.8), 0 0 6px rgba(14, 165, 233, 0.6)",
          transition: progress === 100 ? "width 150ms ease-out" : "width 180ms ease-out",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "80px",
            height: "100%",
            boxShadow: "0 0 16px #6366f1, 0 0 8px #0ea5e9",
            opacity: 1,
            transform: "rotate(3deg) translate(0px, -4px)",
          },
        }}
      />
    </Box>
  );
}

// Global helper functions to programmatically control loading bar
export const appLoading = {
  start: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loading:start"));
    }
  },
  stop: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loading:stop"));
    }
  },
};
