import Link from "next/link";
import { CATEGORIES } from "@/types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

export default function CategoriesPage() {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Browse Categories</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Find the perfect dining experience</Typography>
      </Box>

      <Grid container spacing={2.5}>
        {CATEGORIES.map((cat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={cat.value}>
            <Paper
              component={Link}
              href={`/categories/${cat.slug}`}
              variant="outlined"
              sx={{
                display: "block",
                textDecoration: "none",
                textAlign: "center",
                p: 4,
                borderRadius: 3,
                borderColor: "divider",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                  "& .cat-label": { color: "primary.main" },
                },
              }}
            >
              <Typography sx={{ fontSize: "3rem", mb: 1.5 }}>{cat.emoji}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{cat.label}</Typography>
              <Typography className="cat-label" variant="caption" color="text.secondary" sx={{ transition: "color 0.2s" }}>
                Explore {cat.label.toLowerCase()} →
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
