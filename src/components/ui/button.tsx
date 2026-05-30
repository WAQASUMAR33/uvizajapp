"use client";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const muiVariant = (v: string) => v === "outline" ? "outlined" : v === "ghost" ? "text" : "contained";
const muiColor  = (v: string): any => v === "destructive" ? "error" : v === "gold" ? "secondary" : "primary";
const muiSize   = (s: string): any => s === "lg" ? "large" : s === "sm" ? "small" : "medium";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", loading, children, disabled, className, ...props }, ref) => (
    <MuiButton
      ref={ref}
      variant={muiVariant(variant)}
      color={muiColor(variant)}
      size={muiSize(size)}
      disabled={disabled || loading}
      className={className}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
      {...(props as any)}
    >
      {children}
    </MuiButton>
  )
);

Button.displayName = "Button";
export { Button };
