"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import {
  Tag, Search, Plus, Pencil, Trash2, RefreshCw
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PromoCodeItem {
  id: number;
  code: string;
  titleEn: string | null;
  titleHr: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_FORM = {
  code: "",
  titleEn: "",
  titleHr: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: "" as number | "",
  validUntil: "",
  isActive: true,
};

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes]   = useState<PromoCodeItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeItem | null>(null);
  const [form, setForm]               = useState(DEFAULT_FORM);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promocodes");
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered list
  const filtered = useMemo(() => {
    const now = new Date();
    return promoCodes.filter((item) => {
      const matchSearch =
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        (item.titleEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (item.titleHr ?? "").toLowerCase().includes(search.toLowerCase());
      const isExpired = item.validUntil ? new Date(item.validUntil) < now : false;

      let matchStatus = true;
      if (statusFilter === "active") matchStatus = item.isActive && !isExpired;
      if (statusFilter === "inactive") matchStatus = !item.isActive;
      if (statusFilter === "expired") matchStatus = isExpired;

      return matchSearch && matchStatus;
    });
  }, [promoCodes, search, statusFilter]);

  const openAdd = () => {
    setEditingPromo(null);
    setForm(DEFAULT_FORM);
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEdit = (item: PromoCodeItem) => {
    setEditingPromo(item);
    setForm({
      code: item.code,
      titleEn: item.titleEn || "",
      titleHr: item.titleHr || "",
      discountType: item.discountType,
      discountValue: item.discountValue,
      validUntil: item.validUntil ? item.validUntil.split("T")[0] : "",
      isActive: item.isActive,
    });
    setSaveError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPromo(null);
    setForm(DEFAULT_FORM);
    setSaveError(null);
  };

  const handleToggleActive = async (item: PromoCodeItem) => {
    try {
      await fetch(`/api/promocodes/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      loadData();
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const url = editingPromo ? `/api/promocodes/${editingPromo.id}` : "/api/promocodes";
    const method = editingPromo ? "PUT" : "POST";

    const payload = {
      code: form.code.trim().toUpperCase(),
      titleEn: form.titleEn.trim() || null,
      titleHr: form.titleHr.trim() || null,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      validUntil: form.validUntil ? form.validUntil : null,
      isActive: form.isActive,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Failed to save promo code");
        setSaving(false);
        return;
      }

      setSaving(false);
      closeDialog();
      loadData();
    } catch {
      setSaveError("An unexpected error occurred");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await fetch(`/api/promocodes/${deleteId}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    setDeleteId(null);
    loadData();
  };

  // Metrics
  const activeCount = promoCodes.filter((p) => p.isActive).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Promo Codes & Discounts</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create promotional discount codes (English & Croatian) for web and mobile apps
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={openAdd}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
        >
          Create Promo Code
        </Button>
      </Box>

      {/* Overview Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Promo Codes</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#0f172a" }}>{promoCodes.length}</Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Active Campaigns</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#10b981" }}>{activeCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters & Search */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
        <TextField
          placeholder="Search code or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 320 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          {["all", "active", "inactive", "expired"].map((st) => (
            <Chip
              key={st}
              label={st.charAt(0).toUpperCase() + st.slice(1)}
              onClick={() => setStatusFilter(st)}
              variant={statusFilter === st ? "filled" : "outlined"}
              sx={{
                fontWeight: 600, fontSize: "0.8rem", borderRadius: 2,
                bgcolor: statusFilter === st ? "#4f46e5" : "transparent",
                color: statusFilter === st ? "#fff" : "text.secondary",
              }}
            />
          ))}
        </Box>

        <IconButton size="small" onClick={loadData} sx={{ ml: "auto" }}>
          <RefreshCw size={16} />
        </IconButton>
      </Box>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading promo codes…</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <Tag size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No promo codes found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 600, fontSize: "0.8rem", color: "text.secondary", bgcolor: "#f8fafc" } }}>
                <TableCell>Promo Code</TableCell>
                <TableCell>Titles (English / Croatian)</TableCell>
                <TableCell>Discount Value</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => {
                const isExpired = item.validUntil ? new Date(item.validUntil) < new Date() : false;
                return (
                  <TableRow key={item.id} hover>
                    {/* Code */}
                    <TableCell>
                      <Chip
                        icon={<Tag size={13} color="#4f46e5" />}
                        label={item.code}
                        sx={{
                          fontWeight: 700,
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          bgcolor: "#e0e7ff",
                          color: "#3730a3",
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>

                    {/* Bilingual Titles */}
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          🇬🇧 {item.titleEn || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          🇭🇷 {item.titleHr || "—"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Discount */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#10b981" }}>
                        {item.discountType === "PERCENTAGE" ? `${item.discountValue}% OFF` : `€${item.discountValue.toFixed(2)} OFF`}
                      </Typography>
                    </TableCell>

                    {/* Valid Until */}
                    <TableCell>
                      {item.validUntil ? (
                        <Typography variant="body2" color={isExpired ? "error.main" : "text.secondary"}>
                          {formatDate(item.validUntil)} {isExpired && "(Expired)"}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No Expiry</Typography>
                      )}
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell>
                      <Switch
                        size="small"
                        checked={item.isActive && !isExpired}
                        onChange={() => handleToggleActive(item)}
                        disabled={isExpired}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#4f46e5", mr: 0.5 }}>
                        <Pencil size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteId(item.id)} sx={{ color: "#ef4444" }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingPromo ? "Edit Promo Code" : "Create New Promo Code"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Promo Code String"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            fullWidth size="small" required
            placeholder="e.g. SUMMER50"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Tag size={16} /></InputAdornment> } }}
          />

          {/* Bilingual Titles */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
            <TextField
              label="Title (English 🇬🇧)"
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              fullWidth size="small"
              placeholder="e.g. Summer Special 50% Off"
            />
            <TextField
              label="Title (Croatian 🇭🇷)"
              value={form.titleHr}
              onChange={(e) => setForm((f) => ({ ...f, titleHr: e.target.value }))}
              fullWidth size="small"
              placeholder="e.g. Ljetna akcija 50% popusta"
            />
          </Box>

          <FormControl fullWidth size="small" required>
            <InputLabel>Discount Type</InputLabel>
            <Select
              label="Discount Type"
              value={form.discountType}
              onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
            >
              <MenuItem value="PERCENTAGE">Percentage Discount (%)</MenuItem>
              <MenuItem value="FIXED">Fixed Amount Discount (€)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={form.discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Discount Value (€)"}
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value ? Number(e.target.value) : "" }))}
            fullWidth size="small" type="number" required
            placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 10.00"}
          />

          <TextField
            label="Valid Until Date"
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
            fullWidth size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Active Campaign</Typography>}
          />

          {saveError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{saveError}</Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.code || !form.discountValue}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            {saving ? "Saving…" : editingPromo ? "Save Changes" : "Create Code"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Promo Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this promo code? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600 }}>
            Delete Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
