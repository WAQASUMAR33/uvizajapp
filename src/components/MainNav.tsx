"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/home", label: "Home" },
  { href: "/merchants", label: "Explore" },
  { href: "/categories", label: "Categories" },
];

export default function MainNav({ session }: { session: any }) {
  const pathname = usePathname();

  return (
    <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
      {links.map(({ href, label }) => {
        const active =
          pathname.startsWith(href) && href !== "/home"
            ? true
            : pathname === href && href === "/home";

        return (
          <Button
            key={href}
            component={Link}
            href={href}
            variant={active ? "contained" : "text"}
            color={active ? "primary" : "inherit"}
            size="small"
            sx={{
              borderRadius: "10px",
              px: 2,
              py: 0.8,
              fontWeight: active ? 700 : 500,
              fontSize: "0.875rem",
              color: active ? "#ffffff" : "text.secondary",
              "&:hover": {
                color: active ? "#ffffff" : "text.primary",
                backgroundColor: active ? undefined : "action.hover",
              },
            }}
          >
            {label}
          </Button>
        );
      })}

      {session && (
        <Button
          component={Link}
          href="/profile"
          variant={pathname === "/profile" ? "contained" : "text"}
          color={pathname === "/profile" ? "primary" : "inherit"}
          size="small"
          sx={{
            borderRadius: "10px",
            px: 2,
            py: 0.8,
            fontWeight: pathname === "/profile" ? 700 : 500,
            fontSize: "0.875rem",
            color: pathname === "/profile" ? "#ffffff" : "text.secondary",
            "&:hover": {
              color: pathname === "/profile" ? "#ffffff" : "text.primary",
              backgroundColor: pathname === "/profile" ? undefined : "action.hover",
            },
          }}
        >
          Profile
        </Button>
      )}

      <Box sx={{ ml: 1 }}>
        <ThemeToggle variant="icon" size="small" />
      </Box>
    </Box>
  );
}
