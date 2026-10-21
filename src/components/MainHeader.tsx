"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MainNav from "@/components/MainNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogIn, Sparkles, User } from "lucide-react";

export function MainHeader({ session }: { session: any }) {
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
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "68px !important", px: { xs: 2.5, md: 4 } }}>
        {/* Brand Logo */}
        <Box component={Link} href="/home" sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uzivaj_logo.png"
            alt="Ujivaj"
            style={{ height: 34, width: "auto", objectFit: "contain" }}
          />
        </Box>

        {/* Center / Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <MainNav session={session} />
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <ThemeToggle variant="icon" />
          </Box>

          {session ? (
            <Button
              component={Link}
              href="/admin"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Sparkles size={16} />}
              sx={{ borderRadius: "10px", px: 2.5, py: 0.9, fontWeight: 700 }}
            >
              Dashboard
            </Button>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="small"
                startIcon={<LogIn size={16} />}
                sx={{ borderRadius: "10px", px: 2, py: 0.8, fontWeight: 600 }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="primary"
                size="small"
                sx={{ borderRadius: "10px", px: 2, py: 0.8, fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }}
              >
                Join Now
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default MainHeader;
