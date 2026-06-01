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
import {
  LayoutDashboard, Store, Tag, Users, UserCheck, Receipt, CreditCard, LayoutGrid, LogOut, Sparkles,
} from "lucide-react";

const DRAWER_WIDTH = 256;

const navItems = [
  { href: "/admin",               label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/merchants",     label: "Merchants",    icon: Store },
  { href: "/admin/categories",    label: "Categories",   icon: LayoutGrid },
  { href: "/admin/offers",        label: "Offers",       icon: Tag },
  { href: "/admin/customers",     label: "Customers",    icon: UserCheck },
  { href: "/admin/users",         label: "Admin Users",  icon: Users },
  { href: "/admin/redemptions",   label: "Redemptions",  icon: Receipt },
  { href: "/admin/subscriptions", label: "Subscriptions",icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
          borderRight: "none",
          color: "#fff",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #f59e0b, #eab308)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
          }}>
            <Sparkles size={18} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: "#fff", lineHeight: 1.1, fontWeight: 700 }}>
              Ujivaj
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>Admin Panel</Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }} disablePadding>
        {navItems.map(({ href, label, icon: Icon }) => {
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
                color: active ? "#fff" : "#94a3b8",
                "&.Mui-selected": {
                  backgroundColor: "rgba(255,255,255,0.12)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.07)", color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? "#f59e0b" : "inherit" }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { style: { fontSize: "0.875rem", fontWeight: active ? 600 : 400 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Sign out */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: "10px",
            color: "#94a3b8",
            "&:hover": { backgroundColor: "rgba(239,68,68,0.12)", color: "#fca5a5" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            slotProps={{ primary: { style: { fontSize: "0.875rem" } } }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
