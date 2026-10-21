import { createTheme, ThemeOptions } from "@mui/material/styles";

export function getTheme(mode: "light" | "dark" = "light") {
  const isDark = mode === "dark";

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: isDark
        ? {
            main: "#818cf8",
            light: "#a5b4fc",
            dark: "#6366f1",
            contrastText: "#0b0f19",
          }
        : {
            main: "#4f46e5",
            light: "#6366f1",
            dark: "#4338ca",
            contrastText: "#ffffff",
          },
      secondary: isDark
        ? {
            main: "#fbbf24",
            light: "#fde68a",
            dark: "#f59e0b",
            contrastText: "#0b0f19",
          }
        : {
            main: "#f59e0b",
            light: "#fbbf24",
            dark: "#d97706",
            contrastText: "#ffffff",
          },
      error: {
        main: isDark ? "#f87171" : "#ef4444",
        light: isDark ? "#fca5a5" : "#f87171",
        dark: isDark ? "#ef4444" : "#dc2626",
      },
      success: {
        main: isDark ? "#34d399" : "#10b981",
        light: isDark ? "#6ee7b7" : "#34d399",
        dark: isDark ? "#059669" : "#047857",
      },
      warning: {
        main: isDark ? "#fbbf24" : "#f59e0b",
        light: isDark ? "#fde68a" : "#fbbf24",
        dark: isDark ? "#d97706" : "#b45309",
      },
      info: {
        main: isDark ? "#38bdf8" : "#0284c7",
        light: isDark ? "#7dd3fc" : "#38bdf8",
        dark: isDark ? "#0369a1" : "#075985",
      },
      background: {
        default: isDark ? "#0b0f19" : "#f8fafc",
        paper: isDark ? "#111827" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
        disabled: isDark ? "#64748b" : "#94a3b8",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
        selected: isDark ? "rgba(129, 140, 248, 0.16)" : "rgba(79, 70, 229, 0.08)",
        disabled: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.26)",
        disabledBackground: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
      },
    },
    typography: {
      fontFamily: "var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-0.025em" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.015em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 700, letterSpacing: "-0.005em" },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", lineHeight: 1.5 },
      caption: { fontSize: "0.75rem", lineHeight: 1.4 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
      borderRadius: 0,
    },
    shadows: [
      "none",
      isDark ? "0 1px 2px 0 rgba(0, 0, 0, 0.5)" : "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
      isDark ? "0 2px 4px 0 rgba(0, 0, 0, 0.5)" : "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
      isDark ? "0 4px 8px 0 rgba(0, 0, 0, 0.6)" : "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      isDark ? "0 8px 16px 0 rgba(0, 0, 0, 0.65)" : "0 20px 25px -5px rgba(15, 23, 42, 0.09), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
      isDark ? "0 12px 24px 0 rgba(0, 0, 0, 0.7)" : "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
      ...Array(19).fill(isDark ? "0 16px 32px 0 rgba(0, 0, 0, 0.75)" : "0 25px 50px -12px rgba(15, 23, 42, 0.18)"),
    ] as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? "#374151 #111827" : "#cbd5e1 #f8fafc",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 0,
              backgroundColor: isDark ? "#374151" : "#cbd5e1",
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.3)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          outlined: {
            borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#e2e8f0",
            "&:hover": {
              borderColor: isDark ? "#818cf8" : "#4f46e5",
              backgroundColor: isDark ? "rgba(129, 140, 248, 0.08)" : "rgba(79, 70, 229, 0.04)",
            },
          },
          sizeLarge: { padding: "10px 22px", fontSize: "0.9375rem" },
          sizeMedium: { padding: "8px 18px", fontSize: "0.875rem" },
          sizeSmall: { padding: "5px 12px", fontSize: "0.8125rem" },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundColor: isDark ? "rgba(17, 24, 39, 0.6)" : "rgba(248, 250, 252, 0.8)",
            transition: "border-color 0.18s, box-shadow 0.18s",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1",
            },
            "&.Mui-focused": {
              backgroundColor: isDark ? "#111827" : "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#818cf8" : "#4f46e5",
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            color: isDark ? "#94a3b8" : "#64748b",
            "&.Mui-focused": {
              color: isDark ? "#818cf8" : "#4f46e5",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 0,
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          },
          outlined: {
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: "none",
            backgroundColor: isDark ? "#111827" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}`,
            boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "0 1px 3px 0 rgba(15, 23, 42, 0.06)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundImage: "none",
            backgroundColor: isDark ? "#111827" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0"}`,
            boxShadow: isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.75)"
              : "0 25px 50px -12px rgba(15, 23, 42, 0.2)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.2rem",
            fontWeight: 700,
            padding: "20px 24px 16px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "16px 24px 24px",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 600,
            fontSize: "0.75rem",
          },
          filled: {
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: isDark ? "#94a3b8" : "#64748b",
              backgroundColor: isDark ? "#0d1322" : "#f8fafc",
              borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}`,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.15s ease",
            "&:last-child td": { borderBottom: 0 },
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
            padding: "14px 18px",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            margin: "2px 0",
            transition: "all 0.15s ease",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "transparent"}`,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundImage: "none",
            backgroundColor: isDark ? "#111827" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
            boxShadow: isDark
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.6)"
              : "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 0,
            fontSize: "0.75rem",
            fontWeight: 500,
            backgroundColor: isDark ? "#1f2937" : "#0f172a",
            color: "#ffffff",
            padding: "6px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}

const defaultTheme = getTheme("light");
export default defaultTheme;
