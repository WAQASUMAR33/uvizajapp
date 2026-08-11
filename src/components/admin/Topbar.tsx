"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
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
import { LogOut, ChevronDown } from "lucide-react";

interface AdminTopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = (user.name || user.email || "A")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "flex-end", minHeight: "64px !important", px: 3 }}>
        {/* User menu */}
        <Box>
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            size="small"
            sx={{
              borderRadius: "10px", px: 1.5, py: 0.75, gap: 1,
              border: "1px solid transparent",
              "&:hover": { border: "1px solid", borderColor: "divider", backgroundColor: "action.hover" },
            }}
          >
            <Avatar
              sx={{
                width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
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

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            slotProps={{ paper: {
              sx: { mt: 1, minWidth: 220, borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: 4 },
            } }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.8rem", fontWeight: 700, background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  {user.name && (
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{user.name}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
                </Box>
              </Box>
              <Chip label="Admin" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
            </Box>
            <Divider />
            <MenuItem
              onClick={() => { setAnchor(null); signOut({ callbackUrl: "/login" }); }}
              sx={{ color: "error.main", gap: 1.5, "&:hover": { backgroundColor: "error.light", color: "error.dark" } }}
            >
              <LogOut size={16} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Sign out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
