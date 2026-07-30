"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        p: 3,
      }}
    >
      {/* Decorative Glows */}
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            bgcolor: "rgba(30, 41, 59, 0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uzivaj_logo.png"
              alt="Ujivaj Logo"
              style={{ height: 55, width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </Box>

          {/* Error Badge */}
          <Chip
            icon={<AlertCircle size={15} color="#818cf8" />}
            label="Error 404 — Page Not Found"
            sx={{
              bgcolor: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              fontWeight: 600,
              fontSize: "0.8125rem",
              px: 1.5,
              py: 0.75,
              mb: 3,
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 2,
            }}
          />

          {/* 404 Glowing Number */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4.5rem", sm: "6.5rem" },
              fontWeight: 900,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#f8fafc",
              mb: 1.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Oops! Look like you&apos;re lost.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              maxWidth: 420,
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
              fontSize: "0.9375rem",
            }}
          >
            The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center" }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<Home size={18} />}
              sx={{
                borderRadius: "10px",
                px: 3,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.9375rem",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  boxShadow: "0 6px 20px rgba(79, 70, 229, 0.6)",
                },
              }}
            >
              Back to Home
            </Button>

            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
              variant="outlined"
              size="large"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                borderRadius: "10px",
                px: 3,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.9375rem",
                color: "#e2e8f0",
                borderColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              Go Back
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
