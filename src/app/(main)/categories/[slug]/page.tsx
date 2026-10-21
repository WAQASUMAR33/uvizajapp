import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { CATEGORIES } from "@/types";
import { getCategoryFromSlug } from "@/lib/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Store, ArrowLeft } from "lucide-react";
import type { SafeMerchant } from "@/types";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryValue = getCategoryFromSlug(slug);
  const category = CATEGORIES.find((c) => c.value === categoryValue);
  if (!category) notFound();

  const merchants = (await prisma.merchant.findMany({
    where: { isActive: true, category: categoryValue as any },
    include: { offers: { where: { isActive: true }, take: 3 } },
    orderBy: { createdAt: "desc" },
  })) as SafeMerchant[];

  return (
    <Box sx={{ maxWidth: 1152, mx: "auto", px: 3, py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography component={Link} href="/categories" color="inherit" variant="caption" sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Categories
        </Typography>
        <Typography color="text.primary" variant="caption" sx={{ fontWeight: 700 }}>
          {category.label}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 3 }}>
        <Typography sx={{ fontSize: "3.5rem", lineHeight: 1 }}>{category.emoji}</Typography>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
            {category.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {merchants.length} partner establishment{merchants.length !== 1 ? "s" : ""} offering exclusive perks
          </Typography>
        </Box>
      </Box>

      {merchants.length === 0 ? (
        <Box sx={{ py: 12, textAlign: "center", color: "text.secondary" }}>
          <Store size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary">
            No merchants in this category yet
          </Typography>
          <Button
            component={Link}
            href="/merchants"
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            sx={{ mt: 3, borderRadius: "10px" }}
          >
            Explore all venues
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {merchants.map((merchant) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={merchant.id}>
              <MerchantCard merchant={merchant} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
