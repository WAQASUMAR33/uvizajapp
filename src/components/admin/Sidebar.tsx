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
import Image from "next/image";
import {
  LayoutDashboard, Store, Tag, Users, UserCheck, Receipt,
  CreditCard, LayoutGrid, LogOut, Package, FileText,
} from "lucide-react";

const DRAWER_WIDTH = 256;

type Role = "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "SALESMAN";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",                        label: "Dashboard",         icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"] },
  { href: "/admin/merchants",              label: "Merchants",         icon: Store,           roles: ["SUPER_ADMIN", "ADMIN", "SALESMAN"] },
  { href: "/admin/categories",            label: "Categories",        icon: LayoutGrid,      roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/offers",                label: "Offers",            icon: Tag,             roles: ["SUPER_ADMIN", "ADMIN", "SALESMAN"] },
  { href: "/admin/customers",             label: "Customers",         icon: UserCheck,       roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/redemptions",           label: "Redemptions",       icon: Receipt,         roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/subscriptions",         label: "Subscriptions",     icon: CreditCard,      roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/subscription-packages", label: "Sub. Packages",     icon: Package,         roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { href: "/admin/terms",                 label: "Terms & Conditions",icon: FileText,        roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/users",                 label: "User Management",   icon: Users,           roles: ["SUPER_ADMIN", "ADMIN"] },
];


export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role as Role));

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
      <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "center" }}>
        <Image
          src="/uzivaj_logo.png"
          alt="Ujivaj"
          width={120}
          height={48}
          style={{ objectFit: "contain" }}
        />
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }} disablePadding>
        {visibleItems.map(({ href, label, icon: Icon }) => {
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
