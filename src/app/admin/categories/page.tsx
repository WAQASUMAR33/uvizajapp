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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import { Plus, Edit2, Trash2, LayoutGrid, Search, X, Upload, ImageIcon } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  image: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const empty: Partial<Category> = { name: "", slug: "", emoji: "🍽️", image: null, description: "", isActive: true };

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [open, setOpen]             = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [form, setForm]             = useState<Partial<Category>>(empty);
  const [saving, setSaving]         = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError("");
    setOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm(cat);
    setPreviewUrl(cat.image || null);
    setSelectedFile(null);
    setUploadError("");
    setOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, name, slug: editing ? prev.slug : toSlug(name) }));
  };

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

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    setUploadError("");

    let imageUrl = form.image ?? null;

    if (selectedFile) {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const uploadRes  = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(uploadJson.error || "Upload failed. Please try again.");
        setSaving(false);
        return;
      }
      imageUrl = uploadJson.url;
    }

    const url    = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image: imageUrl }),
    });

    setSaving(false);
    setOpen(false);
    load();
  };

  const handleToggle = async (cat: Category) => {
    await fetch(`/api/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await fetch(`/api/categories/${deleteConfirm.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteConfirm(null);
    load();
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Categories</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{categories.length} total</Typography>
        </Box>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}>
          Add Category
        </MuiButton>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search categories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 320, mb: 3 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

      {/* Table */}
      <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <LayoutGrid size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No categories found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id}>
                  {/* Image */}
                  <TableCell>
                    {cat.image ? (
                      <Avatar
                        src={cat.image}
                        alt={cat.name}
                        variant="square"
                        sx={{ width: 52, height: 52, bgcolor: "#e0e7ff" }}
                      />
                    ) : (
                      <Avatar
                        variant="square"
                        sx={{ width: 52, height: 52, bgcolor: "#e0e7ff", fontSize: "1.5rem" }}
                      >
                        {cat.emoji}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                      {cat.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.description || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cat.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{ bgcolor: cat.isActive ? "#d1fae5" : "#f1f5f9", color: cat.isActive ? "#065f46" : "#475569", fontWeight: 600, fontSize: "0.72rem" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View merchants">
                      <IconButton size="small" component={Link} href={`/admin/merchants?category=${cat.slug}`}>
                        <LayoutGrid size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={cat.isActive ? "Deactivate" : "Activate"}>
                      <Switch size="small" checked={cat.isActive} onChange={() => handleToggle(cat)} color="success" />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(cat)}>
                        <Edit2 size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteConfirm(cat)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          {editing ? "Edit Category" : "Add Category"}
          <IconButton size="small" onClick={() => setOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>

            {/* Image upload */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Category Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                {/* Preview */}
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
                    <Box sx={{ textAlign: "center" }}>
                      <ImageIcon size={28} color="#cbd5e1" />
                      <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
                        Click to upload
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Upload button + instructions */}
                <Box sx={{ flex: 1 }}>
                  <MuiButton
                    variant="outlined"
                    size="small"
                    startIcon={<Upload size={14} />}
                    onClick={() => fileRef.current?.click()}
                    sx={{ mb: 1 }}
                  >
                    Browse Image
                  </MuiButton>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
                    JPEG, PNG, WebP or GIF · Max 5 MB
                  </Typography>
                  {previewUrl && (
                    <MuiButton
                      size="small"
                      color="error"
                      variant="text"
                      sx={{ mt: 0.5, p: 0, minWidth: 0, fontSize: "0.75rem" }}
                      onClick={() => { setPreviewUrl(null); setSelectedFile(null); setForm((p) => ({ ...p, image: null })); if (fileRef.current) fileRef.current.value = ""; }}
                    >
                      Remove image
                    </MuiButton>
                  )}
                </Box>
              </Box>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {uploadError && <Alert severity="error" sx={{ mt: 1.5 }}>{uploadError}</Alert>}
            </Box>

            {/* Name + Emoji */}
            <Box sx={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 2 }}>
              <TextField
                label="Emoji"
                value={form.emoji || ""}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                size="small"
                slotProps={{ htmlInput: { style: { fontSize: "1.5rem", textAlign: "center" } } }}
              />
              <TextField
                label="Category Name *"
                value={form.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                size="small"
                fullWidth
                placeholder="e.g. Casual Dining"
              />
            </Box>

            <TextField
              label="Slug"
              value={form.slug || ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              size="small"
              fullWidth
              helperText="Auto-generated from name — used in URLs"
            />

            <TextField
              label="Description"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
              size="small"
              fullWidth
              placeholder="Short description of this category…"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setOpen(false)}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.name?.trim()}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {saving ? (selectedFile ? "Uploading…" : "Saving…") : editing ? "Save changes" : "Create category"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          Delete Category
          <IconButton size="small" onClick={() => setDeleteConfirm(null)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong style={{ color: "#0f172a" }}>{deleteConfirm?.name}</strong>?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setDeleteConfirm(null)}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Delete
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
