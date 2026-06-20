import Link from "next/link";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { MapPin, Tag } from "lucide-react";
import { getCategoryLabel, getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";
import type { SafeMerchant } from "@/types";

export function MerchantCard({ merchant }: { merchant: SafeMerchant }) {
  const images = getImageArray(merchant.images).map(toImageUrl);
  const imgSrc = images[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(merchant.nameEn || merchant.nameHr)}&background=6366f1&color=fff&size=400`;

  return (
    <Card
      component={Link}
      href={`/merchants/${merchant.id}`}
      sx={{
        textDecoration: "none",
        display: "block",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: 1,
        transition: "all 0.2s",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", height: 176, bgcolor: "grey.100", overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={imgSrc}
          alt={merchant.nameEn || merchant.nameHr}
          sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", "&:hover": { transform: "scale(1.05)" } }}
        />
        <Box sx={{ position: "absolute", top: 10, left: 10 }}>
          <Chip
            label={getCategoryLabel(merchant.category)}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.92)", color: "#4338ca", fontWeight: 600, fontSize: "0.72rem", backdropFilter: "blur(4px)" }}
          />
        </Box>
        {merchant.offers && merchant.offers.length > 0 && (
          <Box sx={{ position: "absolute", top: 10, right: 10 }}>
            <Chip
              icon={<Tag size={11} />}
              label={`${merchant.offers.length} offer${merchant.offers.length > 1 ? "s" : ""}`}
              size="small"
              sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: "0.72rem" }}
            />
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{merchant.nameEn || merchant.nameHr}</Typography>
        {(merchant.descriptionEn || merchant.descriptionHr) && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", mt: 0.5 }}>
            {merchant.descriptionEn || merchant.descriptionHr}
          </Typography>
        )}
        {(merchant.cityEn || merchant.cityHr || merchant.addressEn || merchant.addressHr) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <MapPin size={11} color="#94a3b8" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {[
                merchant.addressEn || merchant.addressHr,
                merchant.cityEn || merchant.cityHr
              ].filter(Boolean).join(", ")}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
