import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function RootLoading() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Top glowing progress bar */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 99999 }}>
        <LinearProgress
          sx={{
            height: "100%",
            borderRadius: 0,
            bgcolor: "rgba(99, 102, 241, 0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 0,
              background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 35%, #0ea5e9 70%, #10b981 100%)",
              boxShadow: "0 0 10px rgba(99, 102, 241, 0.7)",
            },
          }}
        />
      </Box>

      {/* Centered brand loading state */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.02em" }}>
          Loading page…
        </Typography>
      </Box>
    </Box>
  );
}
