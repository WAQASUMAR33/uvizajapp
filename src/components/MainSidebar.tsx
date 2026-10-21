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
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShieldCheck, Store, LayoutGrid, User, Crown, LogOut, Sparkles } from "lucide-react";

const DRAWER_WIDTH = 260;

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
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: "linear-gradient(135deg,#f59e0b,#eab308)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(245,158,11,0.35)" }}>
          <Sparkles size={20} color="#fff" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>Ujivaj</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontWeight: 600 }}>Dining Privileges</Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 2, py: 2 }} disablePadding>
        {mainLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              sx={{
                borderRadius: "12px",
                py: 1.25,
                px: 2,
                mb: 0.75,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  color: "primary.main",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "action.selected" },
                },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: active ? "primary.main" : "text.secondary" }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { style: { fontSize: "0.9375rem", fontWeight: active ? 700 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Appearance
          </Typography>
          <ThemeToggle variant="pill" size="small" />
        </Box>

        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: "12px",
            py: 1.25,
            px: 2,
            color: "error.main",
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Sign out" slotProps={{ primary: { style: { fontSize: "0.9375rem", fontWeight: 600 } } }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
