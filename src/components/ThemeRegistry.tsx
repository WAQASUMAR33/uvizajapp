"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { getTheme } from "@/lib/theme";

type Mode = "light" | "dark";

interface ColorModeContextType {
  mode: Mode;
  toggleColorMode: () => void;
  setColorMode: (mode: Mode) => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: "light",
  toggleColorMode: () => {},
  setColorMode: () => {},
});

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ThemeRegistry provider");
  }
  return context;
}

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored preference or system preference on initial mount
    try {
      const stored = localStorage.getItem("ujivaj-color-mode") as Mode | null;
      if (stored === "dark" || stored === "light") {
        setMode(stored);
        if (stored === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setMode("dark");
        document.documentElement.classList.add("dark");
      }
    } catch {
      // Ignore localStorage read errors in private browsing
    }
    setMounted(true);
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode: Mode = prevMode === "light" ? "dark" : "light";
          try {
            localStorage.setItem("ujivaj-color-mode", nextMode);
            if (nextMode === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          } catch {
            // Ignore storage errors
          }
          return nextMode;
        });
      },
      setColorMode: (newMode: Mode) => {
        setMode(newMode);
        try {
          localStorage.setItem("ujivaj-color-mode", newMode);
          if (newMode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        } catch {
          // Ignore
        }
      },
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
