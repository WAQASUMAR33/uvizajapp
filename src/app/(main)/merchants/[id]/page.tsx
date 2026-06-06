import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OfferCard } from "@/components/offers/OfferCard";
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
import { MapPin, Phone, Globe, Tag, ImageIcon } from "lucide-react";
import type { SafeOffer } from "@/types";

export default async function MerchantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, merchant] = await Promise.all([
    getServerSession(authOptions),
    prisma.merchant.findUnique({
      where: { id: parseInt(id) },
      include: { offers: { where: { isActive: true }, take: 3 } },
    }),
  ]);

  if (!merchant) notFound();

  const images   = getImageArray(merchant.images).map(toImageUrl);
  const mainImg  = images[0] ?? null;
  const userRole = (session?.user as any)?.role;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>

      {/* ── Hero ── */}
      <Box sx={{ position: "relative", height: { xs: 220, md: 340 }, overflow: "hidden", bgcolor: "grey.100" }}>
        {mainImg ? (
          <Box component="img" src={mainImg} alt={merchant.name} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Box sx={{ width: "100%", height: "100%", bgcolor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
            <ImageIcon size={56} color="#a5b4fc" />
          </Box>
        )}

        {/* Dark gradient overlay */}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />

        {/* Text over hero */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: { xs: 2.5, md: 4 }, pb: 3 }}>
          <Chip
            label={getCategoryLabel(merchant.category)}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: "0.72rem", border: "1px solid rgba(255,255,255,0.3)", mb: 1 }}
          />
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            {merchant.name}
          </Typography>
          {merchant.city && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 0.75 }}>
              <MapPin size={14} color="rgba(255,255,255,0.75)" />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>{merchant.city}</Typography>
            </Stack>
          )}
        </Box>
      </Box>

      {/* ── Body ── */}
      <Grid container sx={{ bgcolor: "background.paper", borderTop: "3px solid", borderColor: "primary.main" }}>

        {/* Left — main content */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ borderRight: { md: "1px solid" }, borderColor: { md: "divider" } }}>

          {/* About */}
          {merchant.description && (
            <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>About</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mt: 0.5 }}>
                {merchant.description}
              </Typography>
            </Box>
          )}

          {/* Offers */}
          <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2.5 }}>
              <Tag size={18} color="#4f46e5" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Available Offers</Typography>
              <Chip
                label={merchant.offers.length}
                size="small"
                sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.72rem", minWidth: 24 }}
              />
            </Stack>

            {merchant.offers.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center", bgcolor: "#f8fafc", border: "1px dashed", borderColor: "divider" }}>
                <Tag size={24} color="#cbd5e1" style={{ marginBottom: 6 }} />
                <Typography variant="body2" color="text.secondary">No active offers at this time.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {(merchant.offers as SafeOffer[]).map((offer) => (
                  <OfferCard key={offer.id} offer={offer} userRole={userRole} merchantName={merchant.name} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Gallery */}
          {images.length > 1 && (
            <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 1.5 }}>Gallery</Typography>
              <Grid container spacing={1}>
                {images.slice(1).map((img, i) => (
                  <Grid size={{ xs: 4, sm: 3 }} key={i}>
                    <Box
                      component="img"
                      src={img}
                      alt=""
                      sx={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", border: "1px solid", borderColor: "divider" }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>

        {/* Right — details sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Details</Typography>
          </Box>

          <Table size="small">
            <TableBody>
              {[
                merchant.address
                  ? { icon: <MapPin size={15} />, label: "Address", value: `${merchant.address}${merchant.city ? `, ${merchant.city}` : ""}` }
                  : merchant.city
                  ? { icon: <MapPin size={15} />, label: "City", value: merchant.city }
                  : null,
                merchant.phone
                  ? { icon: <Phone size={15} />, label: "Phone", value: merchant.phone, href: `tel:${merchant.phone}` }
                  : null,
                merchant.website
                  ? { icon: <Globe size={15} />, label: "Website", value: merchant.website.replace(/^https?:\/\//, ""), href: merchant.website }
                  : null,
              ].filter(Boolean).map((row: any) => (
                <TableRow key={row.label} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ width: 36, color: "text.secondary", borderColor: "divider", py: 1.75, pl: 3 }}>
                    {row.icon}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", borderColor: "divider", py: 1.75, pr: 1 }}>
                    {row.label}
                  </TableCell>
                  <TableCell sx={{ borderColor: "divider", py: 1.75, pr: 3 }}>
                    {row.href ? (
                      <Typography component="a" href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" variant="body2" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, wordBreak: "break-all" }}>
                        {row.value}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{row.value}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Savings badge */}
          {merchant.savingsEstimate > 0 && (
            <>
              <Divider />
              <Box sx={{ px: 3, py: 2.5, bgcolor: "#f0fdf4", display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, bgcolor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: "#fff", fontWeight: 800 }}>%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Estimated Savings
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#065f46" }}>
                    ${merchant.savingsEstimate} / visit
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
