import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";

export default function AdminLoading() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, position: "relative" }}>
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

      {/* Header skeleton */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width={220} height={42} sx={{ borderRadius: 0 }} />
        <Skeleton variant="text" width={380} height={20} sx={{ borderRadius: 0 }} />
      </Box>

      {/* 4 widgets per row stat cards skeletons */}
      <Grid container spacing={2.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0, borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ width: "60%" }}>
                  <Skeleton variant="text" width="50%" height={16} sx={{ borderRadius: 0 }} />
                  <Skeleton variant="text" width="80%" height={38} sx={{ borderRadius: 0, mt: 0.5 }} />
                </Box>
                <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 0 }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main content / table skeleton */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Skeleton variant="text" width={240} height={28} sx={{ borderRadius: 0 }} />
          <Skeleton variant="rectangular" width={180} height={36} sx={{ borderRadius: 0 }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
