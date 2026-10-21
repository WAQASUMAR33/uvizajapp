"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useColorMode } from "@/components/ThemeRegistry";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "button" | "pill";
  size?: "small" | "medium";
  className?: string;
  sx?: any;
}

export function ThemeToggle({
  variant = "icon",
  size = "small",
  className,
  sx,
}: ThemeToggleProps) {
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === "dark";

  if (variant === "pill") {
    return (
      <Button
        onClick={toggleColorMode}
        size={size}
        variant="outlined"
        startIcon={
          isDark ? (
            <Sun size={16} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon size={16} className="text-indigo-600 transition-transform duration-300" />
          )
        }
        sx={{
          borderRadius: "9999px",
          px: 2,
          py: 0.75,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.8125rem",
          borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "divider",
          color: isDark ? "#f8fafc" : "text.primary",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
          "&:hover": {
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            borderColor: isDark ? "primary.light" : "primary.main",
          },
          ...sx,
        }}
      >
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </Button>
    );
  }

  if (variant === "button") {
    return (
      <Box
        onClick={toggleColorMode}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 2,
          py: 1.25,
          borderRadius: 2,
          cursor: "pointer",
          color: "text.primary",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-indigo-600" />
          )}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, fontSize: "0.7rem" }}>
          {mode}
        </Typography>
      </Box>
    );
  }

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"} arrow>
      <IconButton
        onClick={toggleColorMode}
        size={size}
        aria-label="toggle light or dark theme"
        className={className}
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "divider",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "background.paper",
          color: isDark ? "#fbbf24" : "#4f46e5",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: isDark ? "rgba(251, 191, 36, 0.12)" : "rgba(79, 70, 229, 0.08)",
            borderColor: isDark ? "#fbbf24" : "#4f46e5",
            transform: "scale(1.05)",
          },
        }}
      >
        {isDark ? (
          <Sun size={19} className="transition-transform duration-300 hover:rotate-90" />
        ) : (
          <Moon size={19} className="transition-transform duration-300 hover:-rotate-12" />
        )}
      </IconButton>
    </Tooltip>
  );
}
export default ThemeToggle;
