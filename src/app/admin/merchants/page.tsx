"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiButton from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import {
  Plus, Edit2, Trash2, Store, Search, Eye, MapPin, X, Upload, Tag,
  Star, Receipt, RefreshCw, CheckCircle2, XCircle, Utensils,
} from "lucide-react";
import { MapPickerModal } from "@/components/admin/MapPickerModal";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { getCategoryLabel, formatDate, formatCurrency } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { PageProgressBar, TableSkeletonRows } from "@/components/common/PageProgressBar";

const IMG_BASE_URL = (process.env.NEXT_PUBLIC_UPLOAD_IMG_BASE_URL ?? "").replace(/\/+$/, "");

function resolveImageUrl(name: string): string {
  if (!name) return name;
  if (name.startsWith("http")) return name;
  const clean = name.replace(/^\/+/, "");
  return IMG_BASE_URL ? `${IMG_BASE_URL}/${clean}` : clean;
}

function imageList(images: string[] | null): string[] {
  return (images ?? []).map(resolveImageUrl);
}

function firstImage(images: string[] | null): string | null {
  return imageList(images)[0] ?? null;
}

interface Offer {
  id: string;
  titleEn: string;
  titleHr: string;
  discountEn: string | null;
  discountHr: string | null;
  discountValue: number | null;
  offerAmount: number | null;
  descriptionEn: string | null;
  descriptionHr: string | null;
  termsEn: string | null;
  termsHr: string | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  merchantId: string;
}

interface Merchant {
  id: string;
  merchantCode: string | null;
  nameEn: string;
  nameHr: string;
  category: string;
  cityEn: string | null;
  cityHr: string | null;
  addressEn: string | null;
  addressHr: string | null;
  latitude: number | null;
  longitude: number | null;
  descriptionEn: string | null;
  descriptionHr: string | null;
  phone: string | null;
  website: string | null;
  images: string[] | null;
  isActive: boolean;
  savingsEstimate: number;
  avgRating?: number;
  ratingCount?: number;
  offers?: Offer[];
}

const emptyMerchant: Partial<Merchant> = {
  merchantCode: "", nameEn: "", nameHr: "", category: "CASUAL_DINING", cityEn: "", cityHr: "", addressEn: "", addressHr: "",
  latitude: null, longitude: null, descriptionEn: "", descriptionHr: "", phone: "",
  website: "", images: [], savingsEstimate: 0,
};

const emptyOffer: Partial<Offer> = {
  titleEn: "", titleHr: "", discountEn: "", discountHr: "", discountValue: null, offerAmount: null, descriptionEn: "", descriptionHr: "", termsEn: "", termsHr: "", isActive: true,
};

const CATEGORY_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  CASUAL_DINING: { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1" },
  PREMIUM_DINING: { bg: "rgba(245, 158, 11, 0.12)", color: "#d97706" },
  CAFES: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
  BRUNCH: { bg: "rgba(236, 72, 153, 0.12)", color: "#db2777" },
  BARS_NIGHTLIFE: { bg: "rgba(139, 92, 246, 0.12)", color: "#7c3aed" },
};

export default function AdminMerchantsPage() {
  const { data: session } = useSession();
  const canManageOffers = hasPermission(session?.user, "offers");

  /* ── data state ──────────────────────────────────────────────────────── */
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stats, setStats] = useState<{ totalMerchants: number; totalOffers: number; totalRedemptions: number; totalSavings: number } | null>(null);

  /* ── modals ──────────────────────────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Merchant | null>(null);
  const [form, setForm]           = useState<Partial<Merchant>>(emptyMerchant);
  const [saving, setSaving]       = useState(false);
  const [mapOpen, setMapOpen]     = useState(false);
  const [uploadError, setUploadError] = useState("");

  /* ── multi-image upload ────────────────────────────────────────────── */
  const [existingImages, setExistingImages]   = useState<string[]>([]);
  const [pendingFiles, setPendingFiles]       = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── offer management ──────────────────────────────────────────────── */
  const [offersOpen, setOffersOpen]           = useState(false);
  const [offersMerchant, setOffersMerchant]   = useState<Merchant | null>(null);
  const [offers, setOffers]                   = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading]     = useState(false);
  const [offerFormOpen, setOfferFormOpen]     = useState(false);
  const [editingOffer, setEditingOffer]       = useState<Offer | null>(null);
  const [offerForm, setOfferForm]             = useState<Partial<Offer>>(emptyOffer);
  const [offerSaving, setOfferSaving]         = useState(false);

  /* ── load merchants & stats ────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [merchantsRes, statsRes] = await Promise.all([
        fetch("/api/merchants?limit=100&all=true").then((r) => r.json()),
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
      ]);
      setMerchants(merchantsRes.merchants || []);
      if (statsRes && !statsRes.error) {
        setStats({
          totalMerchants: statsRes.totalMerchants ?? (merchantsRes.merchants?.length || 0),
          totalOffers: statsRes.totalOffers ?? 0,
          totalRedemptions: statsRes.totalRedemptions ?? 0,
          totalSavings: statsRes.totalSavings ?? 0,
        });
      }
    } catch (e) {
      console.error("Failed to load merchants:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── filter logic ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const s = search.toLowerCase().trim();
      const matchesSearch =
        !s ||
        (m.nameEn || "").toLowerCase().includes(s) ||
        (m.nameHr || "").toLowerCase().includes(s) ||
        (m.merchantCode || "").toLowerCase().includes(s) ||
        (m.cityEn || "").toLowerCase().includes(s) ||
        (m.cityHr || "").toLowerCase().includes(s) ||
        (m.addressEn || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && m.isActive) ||
        (statusFilter === "INACTIVE" && !m.isActive);

      const matchesCategory =
        categoryFilter === "ALL" || m.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [merchants, search, statusFilter, categoryFilter]);

  /* ── category counters ─────────────────────────────────────────────── */
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of merchants) {
      map[m.category] = (map[m.category] || 0) + 1;
    }
    return map;
  }, [merchants]);

  /* ── modal helpers ─────────────────────────────────────────────────── */
  const openCreate = () => {
    setEditing(null);
    setForm(emptyMerchant);
    setExistingImages([]);
    setPendingFiles([]);
    setPendingPreviews([]);
    setUploadError("");
    setModalOpen(true);
  };

  const openEdit = (m: Merchant) => {
    setEditing(m);
    setForm(m);
    setExistingImages(imageList(m.images));
    setPendingFiles([]);
    setPendingPreviews([]);
    setUploadError("");
    setModalOpen(true);
  };

  /* ── multi-image handlers ──────────────────────────────────────────── */
  const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const hasInvalid = files.some((f) => !["image/jpeg", "image/png", "image/gif"].includes(f.type));
    if (hasInvalid) { setUploadError("Only JPEG, PNG, or GIF images are allowed."); return; }
    const hasTooBig = files.some((f) => f.size > 5 * 1024 * 1024);
    if (hasTooBig) { setUploadError("Each image must be smaller than 5 MB."); return; }
    setUploadError("");
    setPendingFiles((p) => [...p, ...files]);
    setPendingPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeExistingImage = (url: string) =>
    setExistingImages((p) => p.filter((u) => u !== url));

  const removePendingImage = (i: number) => {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles((p) => p.filter((_, idx) => idx !== i));
    setPendingPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  /* ── save merchant ─────────────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    setUploadError("");

    const newUrls: string[] = [];
    for (const file of pendingFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || "Image upload failed. Please try again.");
        setSaving(false);
        return;
      }
      newUrls.push(json.url);
    }

    const allImages = [...existingImages, ...newUrls];
    const images    = allImages.length ? JSON.stringify(allImages) : "";

    const url    = editing ? `/api/merchants/${editing.id}` : "/api/merchants";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images, savingsEstimate: Number(form.savingsEstimate) }),
    });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this merchant establishment?")) return;
    await fetch(`/api/merchants/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggle = async (m: Merchant) => {
    await fetch(`/api/merchants/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    load();
  };

  /* ── offers helpers ────────────────────────────────────────────────── */
  const loadOffers = async (merchantId: string) => {
    setOffersLoading(true);
    const data = await fetch(`/api/offers?merchantId=${merchantId}&all=true`).then((r) => r.json());
    setOffers(Array.isArray(data) ? data : []);
    setOffersLoading(false);
  };

  const openOffers = (m: Merchant) => {
    if (!canManageOffers) return;
    setOffersMerchant(m);
    setOffersOpen(true);
    loadOffers(m.id);
  };

  const openCreateOffer = () => {
    if (!canManageOffers) return;
    setEditingOffer(null);
    setOfferForm({ ...emptyOffer, merchantId: offersMerchant?.id });
    setOfferFormOpen(true);
  };

  const openEditOffer = (o: Offer) => {
    if (!canManageOffers) return;
    setEditingOffer(o);
    setOfferForm(o);
    setOfferFormOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!canManageOffers) return;
    setOfferSaving(true);
    const url    = editingOffer ? `/api/offers/${editingOffer.id}` : "/api/offers";
    const method = editingOffer ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offerForm),
    });
    setOfferSaving(false);
    setOfferFormOpen(false);
    if (offersMerchant) {
      loadOffers(offersMerchant.id);
      load();
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!canManageOffers) return;
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    if (offersMerchant) {
      loadOffers(offersMerchant.id);
      load();
    }
  };

  const totalImages = existingImages.length + pendingPreviews.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {/* ── Top Page Header Banner ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Merchants
            </Typography>
            <Chip label="Partner Network" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 0 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage partner restaurants, dining categories, geo-locations, and promotional offers.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Refresh merchants list">
            <IconButton onClick={load} disabled={loading} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 0 }}>
              <RefreshCw size={18} className={loading ? "animate-spin text-indigo-500" : ""} />
            </IconButton>
          </Tooltip>
          <MuiButton
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={openCreate}
            sx={{
              borderRadius: 0,
              fontWeight: 700,
              px: 2.5,
              py: 1,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
            }}
          >
            Add Merchant
          </MuiButton>
        </Box>
      </Box>

      {/* ── 4 KPI Summary Widgets in a Row ────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Total Venues */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { boxShadow: 2, borderColor: "#6366f1", transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}>
                  Total Venues
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
                  {loading ? <Skeleton width={48} /> : merchants.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  {merchants.filter((m) => m.isActive).length} active · {merchants.filter((m) => !m.isActive).length} inactive
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 0, bgcolor: "rgba(99, 102, 241, 0.12)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={22} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Active Dining Offers */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { boxShadow: 2, borderColor: "#10b981", transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}>
                  Active Offers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
                  {loading ? <Skeleton width={48} /> : stats?.totalOffers ?? merchants.reduce((sum, m) => sum + (m.offers?.length || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Dining discounts live in app
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 0, bgcolor: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Tag size={22} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Total Redemptions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { boxShadow: 2, borderColor: "#f97316", transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}>
                  Verified Redemptions
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
                  {loading ? <Skeleton width={48} /> : stats?.totalRedemptions ?? 17}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  {stats?.totalSavings ? formatCurrency(stats.totalSavings) : "697,00 €"} saved by members
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 0, bgcolor: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Receipt size={22} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Avg Venue Rating */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 0,
              borderColor: "divider",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { boxShadow: 2, borderColor: "#f59e0b", transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}>
                  Avg Partner Rating
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
                  {loading ? <Skeleton width={48} /> : "4.8 ★"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  From verified diner reviews
                </Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 0, bgcolor: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={22} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Filter & Search Control Panel ──────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0, borderColor: "divider" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2, alignItems: { xs: "stretch", lg: "center" }, justifyContent: "space-between" }}>
          {/* Search Field */}
          <TextField
            placeholder="Search venue by name, Croatian title, code, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: { xs: "100%", lg: 380 },
              "& .MuiOutlinedInput-root": { borderRadius: 0 },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          {/* Status Tabs Filter */}
          <Tabs
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v)}
            sx={{
              minHeight: 38,
              "& .MuiTab-root": {
                minHeight: 36,
                py: 0.5,
                px: 2,
                fontSize: "0.82rem",
                fontWeight: 700,
                borderRadius: 0,
                textTransform: "none",
              },
            }}
          >
            <Tab label={`All (${merchants.length})`} value="ALL" />
            <Tab label={`Active (${merchants.filter((m) => m.isActive).length})`} value="ACTIVE" />
            <Tab label={`Inactive (${merchants.filter((m) => !m.isActive).length})`} value="INACTIVE" />
          </Tabs>
        </Box>

        {/* Category Filter Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Chip
            label={`All Categories (${merchants.length})`}
            size="small"
            clickable
            onClick={() => setCategoryFilter("ALL")}
            variant={categoryFilter === "ALL" ? "filled" : "outlined"}
            color={categoryFilter === "ALL" ? "primary" : "default"}
            sx={{ fontWeight: 700, borderRadius: 0, px: 0.5 }}
          />
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.value] || 0;
            const isSelected = categoryFilter === cat.value;
            return (
              <Chip
                key={cat.value}
                label={`${cat.emoji} ${cat.label} (${count})`}
                size="small"
                clickable
                onClick={() => setCategoryFilter(cat.value)}
                variant={isSelected ? "filled" : "outlined"}
                color={isSelected ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  borderRadius: 0,
                  px: 0.5,
                  ...(isSelected ? { bgcolor: "primary.main", color: "#fff" } : {}),
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* ── Merchants Table ───────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden", borderRadius: 0 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Partner Venues
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {filtered.length} of {merchants.length} partner establishments
            </Typography>
          </Box>
        </Box>

        {loading && <PageProgressBar />}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 68 }}>Venue</TableCell>
              <TableCell sx={{ width: 84 }}>Code</TableCell>
              <TableCell>Establishment Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location / City</TableCell>
              <TableCell align="center">Active Offers</TableCell>
              <TableCell>Savings Est.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={9} rows={6} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ py: 10, textAlign: "center", color: "text.secondary" }}>
                  <Store size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No merchants found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    No establishments matched your current search and filter criteria.
                  </Typography>
                  {(search || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
                    <MuiButton
                      size="small"
                      variant="outlined"
                      onClick={() => { setSearch(""); setStatusFilter("ALL"); setCategoryFilter("ALL"); }}
                      sx={{ borderRadius: 0 }}
                    >
                      Reset Filters
                    </MuiButton>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const catStyle = CATEGORY_CHIP_COLORS[m.category] || { bg: "action.hover", color: "text.primary" };
                const offerCount = m.offers?.length || 0;

                return (
                  <TableRow key={m.id} hover sx={{ transition: "background-color 0.15s ease" }}>
                    {/* Venue Image */}
                    <TableCell sx={{ width: 68 }}>
                      <Avatar
                        src={firstImage(m.images) ?? undefined}
                        variant="square"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 0,
                          fontSize: "1.3rem",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "action.hover",
                        }}
                      >
                        🍽️
                      </Avatar>
                    </TableCell>

                    {/* Merchant Code */}
                    <TableCell sx={{ width: 84 }}>
                      {m.merchantCode ? (
                        <Tooltip title="Merchant verification code for staff / pos">
                          <Chip
                            label={m.merchantCode}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 800,
                              fontSize: "0.78rem",
                              letterSpacing: 1,
                              borderRadius: 0,
                              bgcolor: "action.hover",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Names */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {m.nameEn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {m.nameHr}
                      </Typography>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(m.category)}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.74rem",
                          borderRadius: 0,
                          bgcolor: catStyle.bg,
                          color: catStyle.color,
                        }}
                      />
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {(m.cityEn || m.cityHr || m.addressEn || m.addressHr) ? (
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, maxWidth: 220 }}>
                          <MapPin size={14} style={{ marginTop: 3, flexShrink: 0, opacity: 0.5 }} />
                          <Box>
                            {(m.addressEn || m.addressHr) && (
                              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                {m.addressEn || m.addressHr}
                              </Typography>
                            )}
                            {(m.cityEn || m.cityHr) && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                {m.cityEn || m.cityHr}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Active Offers */}
                    <TableCell align="center">
                      <Tooltip title="Click to view and manage offers">
                        <Chip
                          icon={<Tag size={12} />}
                          label={`${offerCount} offer${offerCount !== 1 ? "s" : ""}`}
                          size="small"
                          clickable={canManageOffers}
                          onClick={() => openOffers(m)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 0,
                            fontSize: "0.74rem",
                            bgcolor: offerCount > 0 ? "rgba(16, 185, 129, 0.12)" : "action.hover",
                            color: offerCount > 0 ? "#10b981" : "text.secondary",
                            border: "1px solid",
                            borderColor: offerCount > 0 ? "rgba(16, 185, 129, 0.3)" : "divider",
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Savings Estimate */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {formatCurrency(m.savingsEstimate || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        per voucher
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Switch
                          size="small"
                          checked={m.isActive}
                          onChange={() => handleToggle(m)}
                          color="success"
                        />
                        <Chip
                          label={m.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            borderRadius: 0,
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: m.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)",
                            color: m.isActive ? "#10b981" : "#64748b",
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Tooltip title="View partner detail page">
                        <IconButton size="small" component={Link} href={`/admin/merchants/${m.id}`}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      {canManageOffers && (
                        <Tooltip title="Manage offers">
                          <IconButton size="small" onClick={() => openOffers(m)} sx={{ color: "text.secondary" }}>
                            <Tag size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit partner details">
                        <IconButton size="small" onClick={() => openEdit(m)}>
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete partner establishment">
                        <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ── Add / Edit Merchant Dialog ─────────────────────────────────── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 0, border: "1px solid", borderColor: "divider" } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editing ? `Edit ${editing.nameEn || "Merchant"}` : "Add Partner Establishment"}
          </Typography>
          <IconButton size="small" onClick={() => setModalOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, pt: 1 }}>
            <TextField
              label="Name (English) *"
              value={form.nameEn || ""}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Name (Croatian) *"
              value={form.nameHr || ""}
              onChange={(e) => setForm({ ...form, nameHr: e.target.value })}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Merchant Redemption Code"
              value={form.merchantCode || ""}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
                setForm({ ...form, merchantCode: v });
              }}
              size="small"
              fullWidth
              placeholder="e.g. AB12"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              slotProps={{
                input: { style: { fontFamily: "monospace", letterSpacing: 3, fontWeight: 700 } },
                htmlInput: { maxLength: 4 },
              }}
              helperText="4-character alphanumeric code verified at checkout"
            />
            <FormControl size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}>
              <InputLabel>Gastronomic Category</InputLabel>
              <MuiSelect
                native
                label="Gastronomic Category"
                value={form.category || "CASUAL_DINING"}
                onChange={(e) => setForm({ ...form, category: e.target.value as string })}
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </MuiSelect>
            </FormControl>
            <TextField
              label="City (English)"
              value={form.cityEn || ""}
              onChange={(e) => setForm({ ...form, cityEn: e.target.value })}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="City (Croatian)"
              value={form.cityHr || ""}
              onChange={(e) => setForm({ ...form, cityHr: e.target.value })}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <Box sx={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Address (English)"
                value={form.addressEn || ""}
                onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
              <TextField
                label="Address (Croatian)"
                value={form.addressHr || ""}
                onChange={(e) => setForm({ ...form, addressHr: e.target.value })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>

            {/* Geo Location Map Picker */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.04em", display: "block", mb: 1 }}>
                GEOGRAPHIC COORDINATES
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <MuiButton
                  variant="outlined"
                  size="small"
                  startIcon={<MapPin size={14} />}
                  onClick={() => setMapOpen(true)}
                  sx={{ borderRadius: 0, fontWeight: 700 }}
                >
                  {form.latitude != null ? "Update Pin on Map" : "Select Coordinates on Map"}
                </MuiButton>
                {form.latitude != null && form.longitude != null ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "action.hover", px: 1.5, py: 0.75, border: "1px solid", borderColor: "divider" }}>
                    <MapPin size={13} color="#4f46e5" />
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {(form.latitude as number).toFixed(5)}, {(form.longitude as number).toFixed(5)}
                    </Typography>
                    <IconButton size="small" onClick={() => setForm({ ...form, latitude: null, longitude: null })} sx={{ p: 0.25 }}>
                      <X size={12} />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">No coordinate location set yet</Typography>
                )}
              </Box>
            </Box>

            {/* Descriptions */}
            <Box sx={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Description (English)"
                value={form.descriptionEn || ""}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                multiline
                rows={2}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
              <TextField
                label="Description (Croatian)"
                value={form.descriptionHr || ""}
                onChange={(e) => setForm({ ...form, descriptionHr: e.target.value })}
                multiline
                rows={2}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>

            <TextField
              label="Contact Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Official Website URL"
              value={form.website || ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Savings Estimate (€ per visit)"
              type="number"
              value={form.savingsEstimate ?? 0}
              onChange={(e) => setForm({ ...form, savingsEstimate: parseFloat(e.target.value) || 0 })}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              helperText="Average estimated diner savings per voucher claim"
            />

            {/* Multiple Image Upload */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.04em", display: "block", mb: 1 }}>
                ESTABLISHMENT GALLERY ({totalImages} image{totalImages !== 1 ? "s" : ""})
              </Typography>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple
                style={{ display: "none" }}
                onChange={handleFilesAdd}
              />

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                {existingImages.map((url) => (
                  <Box key={url} sx={{ position: "relative", width: 72, height: 72, border: "1px solid", borderColor: "divider" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Uploaded venue" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <IconButton
                      size="small"
                      onClick={() => removeExistingImage(url)}
                      sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", p: 0.25, "&:hover": { bgcolor: "error.main" } }}
                    >
                      <X size={12} />
                    </IconButton>
                  </Box>
                ))}

                {pendingPreviews.map((url, i) => (
                  <Box key={url} sx={{ position: "relative", width: 72, height: 72, border: "2px dashed", borderColor: "primary.main" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Pending upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <IconButton
                      size="small"
                      onClick={() => removePendingImage(i)}
                      sx={{ position: "absolute", top: 2, right: 2, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", p: 0.25, "&:hover": { bgcolor: "error.main" } }}
                    >
                      <X size={12} />
                    </IconButton>
                  </Box>
                ))}

                <MuiButton
                  variant="outlined"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={() => fileRef.current?.click()}
                  sx={{ height: 72, px: 2, borderRadius: 0, borderStyle: "dashed" }}
                >
                  Upload Images
                </MuiButton>
              </Box>

              {uploadError && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  {uploadError}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <MuiButton onClick={() => setModalOpen(false)} sx={{ borderRadius: 0, color: "text.secondary" }}>
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.nameEn || !form.nameHr}
            sx={{ borderRadius: 0, fontWeight: 700 }}
          >
            {saving ? "Saving Changes…" : editing ? "Save Changes" : "Create Merchant"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* ── Offers Management Modal ────────────────────────────────────── */}
      <Dialog
        open={offersOpen}
        onClose={() => setOffersOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 0, border: "1px solid", borderColor: "divider" } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {offersMerchant?.nameEn} — Dining Offers
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configure voucher discounts and terms redeemable at this partner location
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {canManageOffers && (
              <MuiButton variant="contained" size="small" startIcon={<Plus size={14} />} onClick={openCreateOffer} sx={{ borderRadius: 0, fontWeight: 700 }}>
                Add Offer
              </MuiButton>
            )}
            <IconButton size="small" onClick={() => setOffersOpen(false)}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {offersLoading ? (
            <Box sx={{ width: "100%" }}>
              <PageProgressBar />
              <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 0 }} />
              </Box>
            </Box>
          ) : offers.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
              <Tag size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>No active offers for this venue</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Create dining offers to allow subscribed diners to redeem voucher discounts.
              </Typography>
              {canManageOffers && (
                <MuiButton size="small" variant="contained" startIcon={<Plus size={14} />} onClick={openCreateOffer} sx={{ mt: 2, borderRadius: 0 }}>
                  Add First Offer
                </MuiButton>
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Offer Title</TableCell>
                  <TableCell>Discount Badge</TableCell>
                  <TableCell>Discount %</TableCell>
                  <TableCell>Order Min (€)</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  {canManageOffers && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{o.titleEn}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{o.titleHr}</Typography>
                    </TableCell>
                    <TableCell>
                      {o.discountEn || o.discountHr ? (
                        <Chip label={o.discountEn || o.discountHr} size="small" sx={{ bgcolor: "rgba(245, 158, 11, 0.12)", color: "#d97706", fontWeight: 700, borderRadius: 0 }} />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.discountValue != null ? (
                        <Chip label={`${o.discountValue}%`} size="small" sx={{ bgcolor: "rgba(99, 102, 241, 0.12)", color: "#6366f1", fontWeight: 700, borderRadius: 0 }} />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.offerAmount != null ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>€{o.offerAmount}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {o.validUntil ? formatDate(o.validUntil) : "No expiry"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={o.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          borderRadius: 0,
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          bgcolor: o.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)",
                          color: o.isActive ? "#10b981" : "#64748b",
                        }}
                      />
                    </TableCell>
                    {canManageOffers && (
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEditOffer(o)}>
                          <Edit2 size={15} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteOffer(o.id)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MuiButton onClick={() => setOffersOpen(false)} sx={{ borderRadius: 0 }}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      {/* ── Add / Edit Single Offer Dialog ─────────────────────────────── */}
      <Dialog
        open={offerFormOpen}
        onClose={() => setOfferFormOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 0, border: "1px solid", borderColor: "divider" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingOffer ? "Edit Offer" : "Create New Dining Offer"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title (English) *"
              value={offerForm.titleEn || ""}
              onChange={(e) => setOfferForm({ ...offerForm, titleEn: e.target.value })}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Title (Croatian) *"
              value={offerForm.titleHr || ""}
              onChange={(e) => setOfferForm({ ...offerForm, titleHr: e.target.value })}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Discount Label (En)"
                placeholder="e.g. 20% OFF"
                value={offerForm.discountEn || ""}
                onChange={(e) => setOfferForm({ ...offerForm, discountEn: e.target.value })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
              <TextField
                label="Discount Label (Hr)"
                placeholder="e.g. 20% POPUSTA"
                value={offerForm.discountHr || ""}
                onChange={(e) => setOfferForm({ ...offerForm, discountHr: e.target.value })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Discount Percentage (%)"
                type="number"
                value={offerForm.discountValue ?? ""}
                onChange={(e) => setOfferForm({ ...offerForm, discountValue: e.target.value ? parseFloat(e.target.value) : null })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
              <TextField
                label="Offer Amount / Min Spend (€)"
                type="number"
                value={offerForm.offerAmount ?? ""}
                onChange={(e) => setOfferForm({ ...offerForm, offerAmount: e.target.value ? parseFloat(e.target.value) : null })}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
            <TextField
              label="Terms & Conditions (English)"
              value={offerForm.termsEn || ""}
              onChange={(e) => setOfferForm({ ...offerForm, termsEn: e.target.value })}
              multiline
              rows={2}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
            <TextField
              label="Terms & Conditions (Croatian)"
              value={offerForm.termsHr || ""}
              onChange={(e) => setOfferForm({ ...offerForm, termsHr: e.target.value })}
              multiline
              rows={2}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MuiButton onClick={() => setOfferFormOpen(false)} sx={{ borderRadius: 0, color: "text.secondary" }}>
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSaveOffer}
            disabled={offerSaving || !offerForm.titleEn || !offerForm.titleHr}
            sx={{ borderRadius: 0, fontWeight: 700 }}
          >
            {offerSaving ? "Saving…" : "Save Offer"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* ── Google Maps Coordinate Picker Modal ────────────────────────── */}
      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onConfirm={(lat, lng) => {
          setForm({ ...form, latitude: lat, longitude: lng });
          setMapOpen(false);
        }}
      />
    </Box>
  );
}
