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
import { Plus, Edit2, Trash2, Store, Search, Eye, MapPin, X, Upload, ImageIcon } from "lucide-react";
import { MapPickerModal } from "@/components/admin/MapPickerModal";
import { getCategoryLabel, getImageArray } from "@/lib/utils";
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

const empty: Partial<Merchant> = {
  name: "", category: "CASUAL_DINING", city: "", address: "",
  latitude: null, longitude: null, description: "", phone: "",
  website: "", images: "", savingsEstimate: 0,
};

export default function AdminMerchantsPage() {
  const [merchants, setMerchants]   = useState<Merchant[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Merchant | null>(null);
  const [form, setForm]             = useState<Partial<Merchant>>(empty);
  const [saving, setSaving]         = useState(false);
  const [mapOpen, setMapOpen]       = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setUploadError("Only JPEG, PNG, or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5 MB.");
      return;
    }
    setUploadError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/merchants?limit=100").then((r) => r.json());
    setMerchants(data.merchants || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null); setForm(empty); setModalOpen(true);
    setPreviewUrl(null); setSelectedFile(null); setUploadError("");
  };
  const openEdit = (m: Merchant) => {
    setEditing(m); setForm(m); setModalOpen(true);
    setPreviewUrl(firstImage(m.images)); setSelectedFile(null); setUploadError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadError("");

    let images = form.images ?? "";

    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const uploadRes  = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(uploadJson.error || "Image upload failed. Please try again.");
        setSaving(false);
        return;
      }
      images = JSON.stringify([uploadJson.url]);
    }

    const url    = editing ? `/api/merchants/${editing.id}` : "/api/merchants";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, images, savingsEstimate: Number(form.savingsEstimate) }) });
    setSaving(false); setModalOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this merchant?")) return;
    await fetch(`/api/merchants/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggle = async (m: Merchant) => {
    await fetch(`/api/merchants/${m.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    load();
  };

  const filtered = merchants.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Box mb={3} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Merchants</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{merchants.length} total</Typography>
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
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
      />

      <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box py={8} textAlign="center" color="text.secondary">Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box py={8} textAlign="center" color="text.secondary">
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
                  {/* Image column */}
                  <TableCell sx={{ width: 72 }}>
                    <Avatar
                      src={firstImage(m.images) ?? undefined}
                      variant="rounded"
                      sx={{ width: 48, height: 48, fontSize: "1.4rem", bgcolor: "#e0e7ff" }}
                    >
                      🍽️
                    </Avatar>
                  </TableCell>
                  {/* Name column */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{getCategoryLabel(m.category)}</Typography>
                  </TableCell>
                  <TableCell>
                    {(m.city || m.address || m.latitude != null) ? (
                      <Box display="flex" alignItems="flex-start" gap={0.75} maxWidth={200}>
                        <MapPin size={14} style={{ marginTop: 3, flexShrink: 0, color: "#94a3b8" }} />
                        <Box>
                          {m.address && <Typography variant="body2" noWrap>{m.address}</Typography>}
                          {m.city && <Typography variant="caption" color="text.secondary" display="block">{m.city}</Typography>}
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

      {/* Add / Edit Dialog */}
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

            {/* Geo location picker */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                GEO LOCATION
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <MuiButton variant="contained" size="small" startIcon={<MapPin size={14} />} onClick={() => setMapOpen(true)}>
                  {form.latitude != null ? "Change on Map" : "Pick on Map"}
                </MuiButton>
                {form.latitude != null && form.longitude != null ? (
                  <Box display="flex" alignItems="center" gap={1} sx={{ bgcolor: "#e0e7ff", px: 1.5, py: 0.75 }}>
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
            {/* Image upload */}
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1} textTransform="uppercase" letterSpacing={0.5}>
                Merchant Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 100, height: 100, border: "2px dashed", borderColor: "divider",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: "#f8fafc", flexShrink: 0, overflow: "hidden", cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  {previewUrl ? (
                    <Box component="img" src={previewUrl} alt="preview" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Box textAlign="center">
                      <ImageIcon size={28} color="#cbd5e1" />
                      <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                        Click to upload
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box flex={1}>
                  <MuiButton variant="outlined" size="small" startIcon={<Upload size={14} />} onClick={() => fileRef.current?.click()} sx={{ mb: 1 }}>
                    Browse Image
                  </MuiButton>
                  <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.5}>
                    JPEG, PNG, WebP or GIF · Max 5 MB
                  </Typography>
                  {previewUrl && (
                    <MuiButton
                      size="small" color="error" variant="text"
                      sx={{ mt: 0.5, p: 0, minWidth: 0, fontSize: "0.75rem" }}
                      onClick={() => { setPreviewUrl(null); setSelectedFile(null); setForm((p) => ({ ...p, images: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                    >
                      Remove image
                    </MuiButton>
                  )}
                </Box>
              </Box>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" style={{ display: "none" }} onChange={handleFileChange} />
              {uploadError && <Alert severity="error" sx={{ mt: 1.5 }}>{uploadError}</Alert>}
            </Box>
            <TextField label="Est. Savings per Visit ($)" type="number" value={form.savingsEstimate || 0} onChange={(e) => setForm({ ...form, savingsEstimate: parseFloat(e.target.value) })} size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setModalOpen(false)}>Cancel</MuiButton>
          <MuiButton variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined} sx={{ borderRadius: "10px" }}>
            {saving ? (selectedFile ? "Uploading…" : "Saving…") : editing ? "Save changes" : "Create merchant"}
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
