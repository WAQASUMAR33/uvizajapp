import Chip from "@mui/material/Chip";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "gold" | "outline";
}

const colorMap: Record<string, { bg: string; color: string; border?: string }> = {
  default: { bg: "#e0e7ff", color: "#4338ca" },
  success: { bg: "#d1fae5", color: "#065f46" },
  warning: { bg: "#fef3c7", color: "#92400e" },
  error:   { bg: "#fee2e2", color: "#991b1b" },
  gold:    { bg: "#fef9c3", color: "#92400e", border: "#fde68a" },
  outline: { bg: "transparent", color: "#475569", border: "#cbd5e1" },
};

function Badge({ variant = "default", children, className, style, ...props }: BadgeProps) {
  const colors = colorMap[variant];
  return (
    <Chip
      label={<span style={{ display: "flex", alignItems: "center", gap: 2 }}>{children}</span>}
      size="small"
      className={className}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: colors.border ? `1px solid ${colors.border}` : undefined,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        ...style,
      }}
      {...(props as any)}
    />
  );
}

export { Badge };
