"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
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
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import {
  Plus, Edit2, Trash2, Store, Search, Eye, MapPin, X, Upload, ImageIcon, Tag,
} from "lucide-react";
import { MapPickerModal } from "@/components/admin/MapPickerModal";
import { getCategoryLabel, getImageArray, formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/types";

function firstImage(images: string | null): string | null {
  return getImageArray(images)[0] ?? null;
}

interface Merchant {
  id: string;
  name: string;
  category: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  images: string | null;
  isActive: boolean;
  savingsEstimate: number;
}

interface Offer {
  id: string;
  title: string;
  discount: string | null;
  description: string | null;
  terms: string | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  merchantId: string;
}

const emptyMerchant: Partial<Merchant> = {
  name: "", category: "CASUAL_DINING", city: "", address: "",
  latitude: null, longitude: null, description: "", phone: "",
  website: "", images: "", savingsEstimate: 0,
};

const emptyOffer: Partial<Offer> = {
  title: "", discount: "", description: "", terms: "", isActive: true,
};

export default function AdminMerchantsPage() {
  /* ── merchants ─────────────────────────────────────────────────────── */
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
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

  /* ── load merchants ────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/merchants?limit=100").then((r) => r.json());
    setMerchants(data.merchants || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── merchant modal helpers ────────────────────────────────────────── */
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
    setExistingImages(getImageArray(m.images));
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
    if (!confirm("Delete this merchant?")) return;
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
    setOffersMerchant(m);
    setOffersOpen(true);
    loadOffers(m.id);
  };

  const openCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm({ ...emptyOffer, merchantId: offersMerchant?.id });
    setOfferFormOpen(true);
  };

  const openEditOffer = (o: Offer) => {
    setEditingOffer(o);
    setOfferForm(o);
    setOfferFormOpen(true);
  };

  const handleSaveOffer = async () => {
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
    if (offersMerchant) loadOffers(offersMerchant.id);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    if (offersMerchant) loadOffers(offersMerchant.id);
  };

  const filtered = merchants.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalImages = existingImages.length + pendingPreviews.length;

  return (
    <Box>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Merchants</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{merchants.length} total</Typography>
        </Box>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={openCreate} sx={{ ml: "auto" }}>
          Add Merchant
        </MuiButton>
      </Box>

      <TextField
        placeholder="Search merchants…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 320, mb: 3 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

      {/* ── Merchants table ───────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <Store size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No merchants found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 72 }}>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell sx={{ width: 72 }}>
                    <Avatar
                      src={firstImage(m.images) ?? undefined}
                      variant="rounded"
                      sx={{ width: 48, height: 48, fontSize: "1.4rem", bgcolor: "#e0e7ff" }}
                    >
                      🍽️
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.name}</Typography>
                    {getImageArray(m.images).length > 1 && (
                      <Typography variant="caption" color="text.disabled">
                        {getImageArray(m.images).length} images
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{getCategoryLabel(m.category)}</Typography>
                  </TableCell>
                  <TableCell>
                    {(m.city || m.address || m.latitude != null) ? (
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, maxWidth: 200 }}>
                        <MapPin size={14} style={{ marginTop: 3, flexShrink: 0, color: "#94a3b8" }} />
                        <Box>
                          {m.address && <Typography variant="body2" noWrap>{m.address}</Typography>}
                          {m.city && <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{m.city}</Typography>}
                          {m.latitude != null && m.longitude != null && (
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "primary.main" }}>
                              {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{ bgcolor: m.isActive ? "#d1fae5" : "#f1f5f9", color: m.isActive ? "#065f46" : "#475569", fontWeight: 600, fontSize: "0.72rem" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View detail">
                      <IconButton size="small" component={Link} href={`/admin/merchants/${m.id}`}><Eye size={16} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Manage offers">
                      <IconButton size="small" onClick={() => openOffers(m)} sx={{ color: "text.secondary" }}>
                        <Tag size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={m.isActive ? "Deactivate" : "Activate"}>
                      <Switch size="small" checked={m.isActive} onChange={() => handleToggle(m)} color="success" />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(m)}><Edit2 size={16} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ── Add / Edit Merchant Dialog ─────────────────────────────────── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          {editing ? "Edit Merchant" : "Add Merchant"}
          <IconButton size="small" onClick={() => setModalOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, pt: 1 }}>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField label="Name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" />
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <MuiSelect native label="Category" value={form.category || "CASUAL_DINING"} onChange={(e) => setForm({ ...form, category: e.target.value as string })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </MuiSelect>
            </FormControl>
            <TextField label="City" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} size="small" fullWidth />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField label="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} size="small" fullWidth />
            </Box>

            {/* Geo location */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                GEO LOCATION
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <MuiButton variant="contained" size="small" startIcon={<MapPin size={14} />} onClick={() => setMapOpen(true)}>
                  {form.latitude != null ? "Change on Map" : "Pick on Map"}
                </MuiButton>
                {form.latitude != null && form.longitude != null ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#e0e7ff", px: 1.5, py: 0.75 }}>
                    <MapPin size={13} color="#4f46e5" />
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#4338ca", fontWeight: 600 }}>
                      {(form.latitude as number).toFixed(5)}, {(form.longitude as number).toFixed(5)}
                    </Typography>
                    <IconButton size="small" onClick={() => setForm({ ...form, latitude: null, longitude: null })} sx={{ p: 0.25 }}>
                      <X size={12} />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">No location set</Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} size="small" fullWidth />
            </Box>
            <TextField label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} size="small" fullWidth />
            <TextField label="Website" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} size="small" fullWidth />

            {/* ── Multiple images ──────────────────────────────────────── */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Merchant Images {totalImages > 0 && `(${totalImages})`}
                </Typography>
                <MuiButton variant="outlined" size="small" startIcon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
                  Add Image
                </MuiButton>
              </Box>

              {totalImages === 0 ? (
                <Box
                  onClick={() => fileRef.current?.click()}
                  sx={{
                    border: "2px dashed", borderColor: "divider", borderRadius: 2,
                    py: 4, textAlign: "center", cursor: "pointer",
                    "&:hover": { borderColor: "primary.main", bgcolor: "#f8faff" },
                  }}
                >
                  <ImageIcon size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" color="text.disabled">Click to upload images</Typography>
                  <Typography variant="caption" color="text.disabled">JPEG, PNG, GIF · Max 5 MB each</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {existingImages.map((url) => (
                    <Box key={url} sx={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                      <Box
                        component="img"
                        src={url}
                        alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeExistingImage(url)}
                        sx={{ position: "absolute", top: -8, right: -8, bgcolor: "error.main", color: "#fff", width: 20, height: 20, "&:hover": { bgcolor: "error.dark" } }}
                      >
                        <X size={11} />
                      </IconButton>
                    </Box>
                  ))}
                  {pendingPreviews.map((src, i) => (
                    <Box key={i} sx={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                      <Box
                        component="img"
                        src={src}
                        alt=""
                        sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1.5, border: "2px dashed", borderColor: "primary.main" }}
                      />
                      <Chip label="New" size="small" sx={{ position: "absolute", bottom: 4, left: 4, fontSize: "0.6rem", height: 16, bgcolor: "primary.main", color: "#fff" }} />
                      <IconButton
                        size="small"
                        onClick={() => removePendingImage(i)}
                        sx={{ position: "absolute", top: -8, right: -8, bgcolor: "error.main", color: "#fff", width: 20, height: 20, "&:hover": { bgcolor: "error.dark" } }}
                      >
                        <X size={11} />
                      </IconButton>
                    </Box>
                  ))}
                  <Box
                    onClick={() => fileRef.current?.click()}
                    sx={{
                      width: 90, height: 90, border: "2px dashed", borderColor: "divider", borderRadius: 1.5,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, "&:hover": { borderColor: "primary.main", bgcolor: "#f8faff" },
                    }}
                  >
                    <Plus size={20} color="#94a3b8" />
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>Add more</Typography>
                  </Box>
                </Box>
              )}

              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" multiple style={{ display: "none" }} onChange={handleFilesAdd} />
              {uploadError && <Alert severity="error" sx={{ mt: 1.5 }}>{uploadError}</Alert>}
            </Box>

            <TextField
              label="Est. Savings per Visit ($)"
              type="number"
              value={form.savingsEstimate || 0}
              onChange={(e) => setForm({ ...form, savingsEstimate: parseFloat(e.target.value) })}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setModalOpen(false)}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ borderRadius: "10px" }}
          >
            {saving ? (pendingFiles.length > 0 ? "Uploading…" : "Saving…") : editing ? "Save changes" : "Create merchant"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* ── Offers management dialog ───────────────────────────────────── */}
      <Dialog open={offersOpen} onClose={() => setOffersOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {offersMerchant?.name} — Offers
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {offersLoading ? "Loading…" : `${offers.length} offer${offers.length !== 1 ? "s" : ""}`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <MuiButton variant="contained" size="small" startIcon={<Plus size={14} />} onClick={openCreateOffer} sx={{ borderRadius: "8px" }}>
              Add Offer
            </MuiButton>
            <IconButton size="small" onClick={() => setOffersOpen(false)}><X size={18} /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {offersLoading ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              <CircularProgress size={24} />
            </Box>
          ) : offers.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              <Tag size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <Typography variant="body2">No offers yet</Typography>
              <MuiButton size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={openCreateOffer} sx={{ mt: 2 }}>
                Add first offer
              </MuiButton>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{o.title}</Typography>
                      {o.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 280 }}>
                          {o.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.discount
                        ? <Chip label={o.discount} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.72rem" }} />
                        : <Typography variant="body2" color="text.disabled">—</Typography>}
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
                        sx={{ bgcolor: o.isActive ? "#d1fae5" : "#f1f5f9", color: o.isActive ? "#065f46" : "#475569", fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditOffer(o)}><Edit2 size={15} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteOffer(o.id)}><Trash2 size={15} /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <MuiButton variant="text" onClick={() => setOffersOpen(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      {/* ── Add / Edit Offer dialog ────────────────────────────────────── */}
      <Dialog open={offerFormOpen} onClose={() => setOfferFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          {editingOffer ? "Edit Offer" : "Add Offer"}
          <IconButton size="small" onClick={() => setOfferFormOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title *"
            value={offerForm.title || ""}
            onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Discount label"
            value={offerForm.discount || ""}
            onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
            placeholder="e.g. 20% OFF"
            size="small"
            fullWidth
          />
          <TextField
            label="Description"
            value={offerForm.description || ""}
            onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
            multiline
            rows={3}
            size="small"
            fullWidth
          />
          <TextField
            label="Terms & Conditions"
            value={offerForm.terms || ""}
            onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
          <TextField
            label="Valid until (optional)"
            type="date"
            value={offerForm.validUntil ? String(offerForm.validUntil).slice(0, 10) : ""}
            onChange={(e) => setOfferForm({ ...offerForm, validUntil: e.target.value || null })}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setOfferFormOpen(false)}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSaveOffer}
            disabled={offerSaving}
            startIcon={offerSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ borderRadius: "10px" }}
          >
            {editingOffer ? "Save changes" : "Create offer"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onConfirm={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
      />
    </Box>
  );
}
