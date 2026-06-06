import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel, getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import MuiButton from "@mui/material/Button";
import { ArrowLeft, MapPin, Phone, Globe, Percent, Tag, ImageIcon } from "lucide-react";

async function getMerchant(id: string) {
  return prisma.merchant.findUnique({
    where: { id: parseInt(id) },
    include: { offers: { where: { isActive: true }, orderBy: { createdAt: "asc" }, take: 3 } },
  });
}

export default async function MerchantDetailPage({ params }: { params: { id: string } }) {
  const merchant = await getMerchant(params.id);
  if (!merchant) notFound();

  const images    = getImageArray(merchant.images).map(toImageUrl);
  const heroImage = images[0] ?? null;

  return (
    <Box>
      {/* ── Breadcrumb bar ── */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 3, py: 1.5, bgcolor: "background.paper" }}>
        <MuiButton
          component={Link}
          href="/admin/merchants"
          startIcon={<ArrowLeft size={15} />}
          variant="text"
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          Merchants
        </MuiButton>
        <Typography component="span" variant="caption" color="text.disabled" sx={{ mx: 1 }}>/</Typography>
        <Typography component="span" variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>{merchant.name}</Typography>
      </Box>

      {/* ── Hero image ── */}
      <Box sx={{ position: "relative", height: { xs: 200, md: 300 }, overflow: "hidden", bgcolor: "grey.100" }}>
        {heroImage ? (
          <Box
            component="img"
            src={heroImage}
            alt={merchant.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", bgcolor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
            <ImageIcon size={48} color="#a5b4fc" />
            <Typography variant="body2" color="primary.light">No image</Typography>
          </Box>
        )}

        {/* Status overlay */}
        <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 1 }}>
          <Chip
            label={getCategoryLabel(merchant.category)}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.92)", color: "#4338ca", fontWeight: 700, fontSize: "0.72rem" }}
          />
          <Chip
            label={merchant.isActive ? "Active" : "Inactive"}
            size="small"
            sx={{ bgcolor: merchant.isActive ? "#d1fae5" : "#f1f5f9", color: merchant.isActive ? "#065f46" : "#64748b", fontWeight: 700, fontSize: "0.72rem" }}
          />
        </Box>
      </Box>

      {/* ── Main content ── */}
      <Grid container sx={{ borderTop: "1px solid", borderColor: "divider" }}>

        {/* Left — details */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ borderRight: { md: "1px solid" }, borderColor: { md: "divider" } }}>

          {/* Name + description */}
          <Box sx={{ px: 4, py: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>{merchant.name}</Typography>
            {merchant.description ? (
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>{merchant.description}</Typography>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>No description provided.</Typography>
            )}
          </Box>

          {/* Offers */}
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Tag size={18} color="#4f46e5" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Active Offers</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">{merchant.offers.length} of 3 shown</Typography>
            </Box>

            {merchant.offers.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center", bgcolor: "#f8fafc", border: "1px dashed", borderColor: "divider" }}>
                <Tag size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>No active offers</Typography>
                <MuiButton component={Link} href="/admin/offers" variant="outlined" size="small" sx={{ mt: 1 }}>
                  Add Offers
                </MuiButton>
              </Box>
            ) : (
              <Stack divider={<Divider />} sx={{ border: "1px solid", borderColor: "divider" }}>
                {merchant.offers.map((offer, i) => (
                  <Box key={offer.id} sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "flex-start" }}>
                    {/* Index badge */}
                    <Box sx={{ width: 28, height: 28, bgcolor: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>{i + 1}</Typography>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{offer.title}</Typography>
                        {offer.discount && (
                          <Chip label={offer.discount} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.7rem" }} />
                        )}
                        {(offer as any).offerAmount != null && (
                          <Chip label={`€${(offer as any).offerAmount}`} size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.7rem" }} />
                        )}
                      </Stack>
                      {offer.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{offer.description}</Typography>
                      )}
                      {offer.terms && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                          {offer.terms}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Gallery */}
          {images.length > 1 && (
            <Box sx={{ px: 4, py: 3, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Gallery</Typography>
              <Grid container spacing={1}>
                {images.slice(1).map((img, i) => (
                  <Grid size={{ xs: 4, sm: 3 }} key={i}>
                    <Box
                      component="img"
                      src={img}
                      alt={`${merchant.name} ${i + 2}`}
                      sx={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", border: "1px solid", borderColor: "divider" }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>

        {/* Right — info panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 3, py: 2, bgcolor: "#f8fafc" }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Merchant Info</Typography>
          </Box>

          <Table size="small">
            <TableBody>
              {[
                merchant.address || merchant.city
                  ? { icon: <MapPin size={15} />, label: "Location", value: [merchant.address, merchant.city].filter(Boolean).join(", ") }
                  : null,
                merchant.phone
                  ? { icon: <Phone size={15} />, label: "Phone", value: merchant.phone }
                  : null,
                merchant.website
                  ? { icon: <Globe size={15} />, label: "Website", value: merchant.website, link: true }
                  : null,
                merchant.savingsEstimate > 0
                  ? { icon: <Percent size={15} />, label: "Est. Savings", value: `$${merchant.savingsEstimate} per visit` }
                  : null,
                merchant.latitude != null
                  ? { icon: <MapPin size={15} color="#4f46e5" />, label: "Coordinates", value: `${merchant.latitude.toFixed(6)}, ${merchant.longitude?.toFixed(6)}`, mono: true }
                  : null,
              ].filter(Boolean).map((row: any) => (
                <TableRow key={row.label} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ width: 40, color: "text.secondary", borderColor: "divider", py: 1.5, pl: 3 }}>
                    {row.icon}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem", fontWeight: 600, borderColor: "divider", py: 1.5, pr: 2 }}>
                    {row.label}
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider", py: 1.5, pr: 3 }}>
                    {row.link ? (
                      <Typography
                        component="a"
                        href={row.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, wordBreak: "break-all" }}
                      >
                        {row.value.replace(/^https?:\/\//, "")}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontFamily: row.mono ? "monospace" : "inherit", color: row.mono ? "primary.main" : "text.primary", fontWeight: row.mono ? 600 : 400, wordBreak: "break-all" }}>
                        {row.value}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider />

          <Box sx={{ px: 3, py: 2.5 }}>
            <MuiButton
              component={Link}
              href="/admin/merchants"
              variant="outlined"
              fullWidth
              startIcon={<ArrowLeft size={15} />}
            >
              Back to Merchants
            </MuiButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
