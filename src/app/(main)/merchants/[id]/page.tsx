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
import { MapPin, Phone, Globe, Tag, ImageIcon, DollarSign } from "lucide-react";
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

  let redeemedOfferIds = new Set<number>();
  if (session?.user?.email) {
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (customer) {
      const redemptions = await prisma.redemption.findMany({
        where: { customerId: customer.id, offerId: { in: merchant.offers.map((o) => o.id) } },
        select: { offerId: true },
      });
      redeemedOfferIds = new Set(redemptions.map((r) => r.offerId));
    }
  }

  const images   = getImageArray(merchant.images).map(toImageUrl);
  const mainImg  = images[0] ?? null;
  const userRole = (session?.user as any)?.role;

  return (
    <Box sx={{ maxWidth: 1152, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: "24px",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* ── Hero ── */}
        <Box sx={{ position: "relative", height: { xs: 240, md: 360 }, overflow: "hidden", bgcolor: "action.hover" }}>
          {mainImg ? (
            <Box
              component="img"
              src={mainImg}
              alt={merchant.nameEn || merchant.nameHr}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
              <ImageIcon size={56} opacity={0.3} />
            </Box>
          )}

          {/* Dark gradient overlay */}
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

          {/* Text over hero */}
          <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: { xs: 3, md: 5 }, pb: 3.5 }}>
            <Chip
              label={getCategoryLabel(merchant.category)}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#ffffff", fontWeight: 700, fontSize: "0.75rem", backdropFilter: "blur(8px)", mb: 1.5 }}
            />
            <Typography variant="h3" sx={{ color: "#ffffff", fontWeight: 800, lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {merchant.nameEn || merchant.nameHr}
            </Typography>
            {(merchant.cityEn || merchant.cityHr) && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                <MapPin size={16} color="rgba(255,255,255,0.85)" />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                  {[merchant.addressEn || merchant.addressHr, merchant.cityEn || merchant.cityHr].filter(Boolean).join(", ")}
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>

        {/* ── Body ── */}
        <Grid container sx={{ bgcolor: "background.paper" }}>
          {/* Left — main content */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ borderRight: { md: "1px solid" }, borderColor: { md: "divider" } }}>
            {/* About */}
            {(merchant.descriptionEn || merchant.descriptionHr) && (
              <Box sx={{ px: { xs: 3, md: 5 }, py: 3.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                  About the Establishment
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, mt: 1 }}>
                  {merchant.descriptionEn || merchant.descriptionHr}
                </Typography>
              </Box>
            )}

            {/* Offers */}
            <Box sx={{ px: { xs: 3, md: 5 }, py: 3.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
                <Tag size={20} color="#6366f1" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Available Offers
                </Typography>
                <Chip
                  label={`${merchant.offers.length} active`}
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                />
              </Stack>

              {merchant.offers.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center", bgcolor: "action.hover", borderRadius: "14px", border: "1px dashed", borderColor: "divider" }}>
                  <Tag size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <Typography variant="body2" color="text.secondary">
                    No active offers at this time. Check back soon!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  {(merchant.offers as SafeOffer[]).map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={{ ...offer, isRedeemed: redeemedOfferIds.has(offer.id) }}
                      userRole={userRole}
                      merchantName={merchant.nameEn || merchant.nameHr}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {/* Gallery */}
            {images.length > 1 && (
              <Box sx={{ px: { xs: 3, md: 5 }, py: 3.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", mb: 2 }}>
                  Photo Gallery
                </Typography>
                <Grid container spacing={1.5}>
                  {images.slice(1).map((img, i) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={i}>
                      <Box
                        component="img"
                        src={img}
                        alt=""
                        sx={{
                          width: "100%",
                          aspectRatio: "4/3",
                          objectFit: "cover",
                          borderRadius: "12px",
                          display: "block",
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "transform 0.2s ease",
                          "&:hover": { transform: "scale(1.02)" },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right — details sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ px: 3, py: 2.5, bgcolor: "action.hover", borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Establishment Details
              </Typography>
            </Box>

            <Table size="small">
              <TableBody>
                {[
                  merchant.addressEn || merchant.addressHr
                    ? { icon: <MapPin size={16} />, label: "Address", value: `${merchant.addressEn || merchant.addressHr}${merchant.cityEn || merchant.cityHr ? `, ${merchant.cityEn || merchant.cityHr}` : ""}` }
                    : merchant.cityEn || merchant.cityHr
                    ? { icon: <MapPin size={16} />, label: "City", value: merchant.cityEn || merchant.cityHr }
                    : null,
                  merchant.phone
                    ? { icon: <Phone size={16} />, label: "Phone", value: merchant.phone, href: `tel:${merchant.phone}` }
                    : null,
                  merchant.website
                    ? { icon: <Globe size={16} />, label: "Website", value: merchant.website.replace(/^https?:\/\//, ""), href: merchant.website }
                    : null,
                ].filter(Boolean).map((row: any) => (
                  <TableRow key={row.label} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ width: 36, color: "text.secondary", borderColor: "divider", py: 2, pl: 3 }}>
                      {row.icon}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", borderColor: "divider", py: 2, pr: 1 }}>
                      {row.label}
                    </TableCell>
                    <TableCell sx={{ borderColor: "divider", py: 2, pr: 3 }}>
                      {row.href ? (
                        <Typography component="a" href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" variant="body2" sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" }, wordBreak: "break-all" }}>
                          {row.value}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ wordBreak: "break-word", fontWeight: 500 }}>{row.value}</Typography>
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
                <Box sx={{ p: 3, bgcolor: "action.selected", display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: "10px", bgcolor: "secondary.main", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DollarSign size={20} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Estimated Savings
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                      ${merchant.savingsEstimate} / visit
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
