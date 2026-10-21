"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, ChevronDown, ExternalLink, ShieldCheck, User } from "lucide-react";

interface AdminTopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = (user.name || user.email || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: "64px !important",
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left Side: System Status / Portal Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label="Administration Portal"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: 0,
              bgcolor: "action.hover",
              borderColor: "divider",
              border: "1px solid",
            }}
          />
        </Box>

        {/* Right Side: Quick Action + Theme Toggle + User Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Quick link to public explore */}
          <Tooltip title="View Customer Portal" arrow>
            <IconButton
              component={Link}
              href="/merchants"
              target="_blank"
              size="small"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <ExternalLink size={18} />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle Component (Light / Dark) */}
          <ThemeToggle variant="icon" sx={{ borderRadius: 0 }} />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: "center" }} />

          {/* User profile dropdown button */}
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            size="small"
            sx={{
              borderRadius: 0,
              px: 1.25,
              py: 0.6,
              gap: 1.25,
              border: "1px solid",
              borderColor: anchor ? "primary.main" : "transparent",
              backgroundColor: anchor ? "action.selected" : "transparent",
              "&:hover": {
                borderColor: "divider",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.8rem",
                fontWeight: 700,
                borderRadius: 0,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#ffffff",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
              {user.name && (
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {user.email}
              </Typography>
            </Box>
            <ChevronDown size={14} style={{ color: "#94a3b8" }} />
          </IconButton>

          {/* User popup menu */}
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 240,
                  borderRadius: 0,
                  p: 0.5,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    borderRadius: 0,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: "#ffffff",
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  {user.name && (
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {user.name}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Chip
                icon={<ShieldCheck size={12} />}
                label="Admin Portal"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700, borderRadius: 0 }}
              />
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              component={Link}
              href="/profile"
              onClick={() => setAnchor(null)}
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: 0,
                gap: 1.5,
                color: "text.primary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <User size={16} className="text-slate-400" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                My Profile
              </Typography>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                setAnchor(null);
                signOut({ callbackUrl: "/login" });
              }}
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: 0,
                color: "error.main",
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              <LogOut size={16} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Sign out
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
