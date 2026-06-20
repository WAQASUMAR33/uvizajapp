"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface SubPackage {
  id: number;
  titleEn: string;
  titleHr: string;
  priceMonthly: number;
  priceYearly: number;
  discountValue: number | null;
  descriptionEn: string | null;
  descriptionHr: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  titleEn: "",
  titleHr: "",
  priceMonthly: "",
  priceYearly: "",
  discountValue: "",
  descriptionEn: "",
  descriptionHr: "",
  isActive: true,
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = ["header", "bold", "italic", "underline", "strike", "list", "link"];

export default function SubscriptionPackagesPage() {
  const [packages, setPackages] = useState<SubPackage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]   = useState<SubPackage | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/subscription-packages");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load packages");
        setPackages([]);
      } else {
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Network error — could not reach the server");
      setPackages([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEdit = (pkg: SubPackage) => {
    setEditing(pkg);
    setForm({
      titleEn: pkg.titleEn,
      titleHr: pkg.titleHr,
      priceMonthly: String(pkg.priceMonthly),
      priceYearly: String(pkg.priceYearly),
      discountValue: pkg.discountValue == null ? "" : String(pkg.discountValue),
      descriptionEn: pkg.descriptionEn ?? "",
      descriptionHr: pkg.descriptionHr ?? "",
      isActive: pkg.isActive,
    });
    setSaveError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!form.titleEn || !form.titleHr || !form.priceMonthly || !form.priceYearly) return;
    setSaving(true);
    setSaveError(null);
    const method = editing ? "PUT" : "POST";
    const url    = editing
      ? `/api/subscription-packages/${editing.id}`
      : "/api/subscription-packages";

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save package");
        setSaving(false);
        return;
      }
    } catch {
      setSaveError("Network error — could not reach the server");
      setSaving(false);
      return;
    }

    setSaving(false);
    closeDialog();
    load();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    await fetch(`/api/subscription-packages/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

  const filtered = useMemo(
    () => packages.filter((p) => (p.titleEn || "").toLowerCase().includes(search.toLowerCase()) || (p.titleHr || "").toLowerCase().includes(search.toLowerCase())),
    [packages, search]
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Subscription Packages</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {packages.filter((p) => p.isActive).length} active packages
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={openAdd}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
        >
          Add Package
        </Button>
      </Box>

      {/* Error banner */}
      {error && (
        <Paper variant="outlined" sx={{ mb: 3, p: 2, borderRadius: 2, borderColor: "#fca5a5", bgcolor: "#fef2f2" }}>
          <Typography variant="body2" color="error">{error}</Typography>
        </Paper>
      )}

      {/* Search */}
      <TextField
        placeholder="Search packages…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 320, mb: 3 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <Package size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No packages found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Monthly Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Yearly Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Discount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((pkg) => (
                <TableRow key={pkg.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{pkg.titleEn}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{pkg.titleHr}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      dangerouslySetInnerHTML={{ __html: pkg.descriptionEn || pkg.descriptionHr || "—" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>€{pkg.priceMonthly.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>€{pkg.priceYearly.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    {pkg.discountValue != null ? (
                      <Chip
                        label={`${pkg.discountValue}% OFF`}
                        size="small"
                        sx={{ bgcolor: "#ede9fe", color: "#5b21b6", fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pkg.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={pkg.isActive
                        ? { bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }
                        : { bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: "0.72rem" }
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(pkg)} sx={{ color: "#4f46e5", mr: 0.5 }}>
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(pkg.id)} sx={{ color: "#ef4444" }}>
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit Package" : "New Subscription Package"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Title (English)"
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Title (Croatian)"
              value={form.titleHr}
              onChange={(e) => setForm((f) => ({ ...f, titleHr: e.target.value }))}
              fullWidth
              size="small"
              required
            />
          </Box>

          {/* Rich text description English */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Description (English)
            </Typography>
            <Box sx={{
              ".ql-container": { borderRadius: "0 0 8px 8px", fontFamily: "inherit", fontSize: "0.875rem" },
              ".ql-toolbar": { borderRadius: "8px 8px 0 0", borderColor: "rgba(0,0,0,0.23)" },
              ".ql-container.ql-snow": { borderColor: "rgba(0,0,0,0.23)", minHeight: 100 },
              "&:focus-within .ql-toolbar, &:focus-within .ql-container": { borderColor: "#4f46e5" },
            }}>
              <ReactQuill
                theme="snow"
                value={form.descriptionEn}
                onChange={(val) => setForm((f) => ({ ...f, descriptionEn: val }))}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Enter package description in English…"
              />
            </Box>
          </Box>

          {/* Rich text description Croatian */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Description (Croatian)
            </Typography>
            <Box sx={{
              ".ql-container": { borderRadius: "0 0 8px 8px", fontFamily: "inherit", fontSize: "0.875rem" },
              ".ql-toolbar": { borderRadius: "8px 8px 0 0", borderColor: "rgba(0,0,0,0.23)" },
              ".ql-container.ql-snow": { borderColor: "rgba(0,0,0,0.23)", minHeight: 100 },
              "&:focus-within .ql-toolbar, &:focus-within .ql-container": { borderColor: "#4f46e5" },
            }}>
              <ReactQuill
                theme="snow"
                value={form.descriptionHr}
                onChange={(val) => setForm((f) => ({ ...f, descriptionHr: val }))}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Enter package description in Croatian…"
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Monthly Price (€)"
              value={form.priceMonthly}
              onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))}
              fullWidth
              size="small"
              type="number"
              required
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <TextField
              label="Yearly Price (€)"
              value={form.priceYearly}
              onChange={(e) => setForm((f) => ({ ...f, priceYearly: e.target.value }))}
              fullWidth
              size="small"
              type="number"
              required
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
          </Box>

          <TextField
            label="Discount (%)"
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            fullWidth
            size="small"
            type="number"
            placeholder="e.g. 10"
            helperText="Optional — leave blank for no discount"
            slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                color="primary"
              />
            }
            label="Active"
          />

          {saveError && (
            <Typography variant="body2" color="error">{saveError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.titleEn || !form.titleHr || !form.priceMonthly || !form.priceYearly}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Package"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Package</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone. Are you sure you want to delete this package?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
