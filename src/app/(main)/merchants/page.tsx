import { prisma } from "@/lib/prisma";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { CATEGORIES } from "@/types";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { Store } from "lucide-react";
import type { SafeMerchant } from "@/types";

async function getMerchants(category?: string) {
  const where: any = { isActive: true };
  if (category) where.category = category;
  return prisma.merchant.findMany({
    where,
    include: { offers: { where: { isActive: true }, take: 3 } },
    orderBy: { createdAt: "desc" },
  }) as Promise<SafeMerchant[]>;
}

export default async function MerchantsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const merchants = await getMerchants(category);

  return (
    <Box sx={{ maxWidth: 1152, mx: "auto", px: 3, py: 4 }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>All Merchants</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>Discover exclusive offers from top establishments</Typography>
      </Box>

      {/* Category filter chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4 }}>
        <Chip
          component={Link}
          href="/merchants"
          label="All"
          clickable
          variant={!category ? "filled" : "outlined"}
          color={!category ? "primary" : "default"}
          sx={{ fontWeight: 600 }}
        />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.value}
            component={Link}
            href={`/merchants?category=${cat.value}`}
            label={`${cat.emoji} ${cat.label}`}
            clickable
            variant={category === cat.value ? "filled" : "outlined"}
            color={category === cat.value ? "primary" : "default"}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>

      {merchants.length === 0 ? (
        <Box py={12} textAlign="center" color="text.secondary">
          <Store size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary">No merchants found</Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>Try a different category</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            {merchants.length} merchant{merchants.length !== 1 ? "s" : ""}
          </Typography>
          <Grid container spacing={2.5}>
            {merchants.map((merchant) => (
              <Grid item xs={12} sm={6} lg={4} key={merchant.id}>
                <MerchantCard merchant={merchant} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}
