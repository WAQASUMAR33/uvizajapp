"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ShieldCheck, Store, LayoutGrid, User, Crown, LogOut, Sparkles } from "lucide-react";

const DRAWER_WIDTH = 240;

const mainLinks = [
  { href: "/admin",      label: "Dashboard",  icon: ShieldCheck },
  { href: "/merchants",  label: "Explore",    icon: Store },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/profile",    label: "Profile",    icon: User },
  { href: "/subscribe",  label: "Subscribe",  icon: Crown },
];

export function MainSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "flex" },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: "9px", background: "linear-gradient(135deg,#f59e0b,#eab308)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}>
          <Sparkles size={16} color="#fff" />
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>Ujivaj</Typography>
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 1.5 }} disablePadding>
        {mainLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              sx={{
                borderRadius: "10px",
                mb: 0.25,
                "&.Mui-selected": { bgcolor: "#e0e7ff", color: "#4338ca", "&:hover": { bgcolor: "#c7d2fe" } },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? "#4f46e5" : "text.secondary" }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: active ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{ borderRadius: "10px", "&:hover": { bgcolor: "#fee2e2", color: "#dc2626" } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: "0.875rem" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
