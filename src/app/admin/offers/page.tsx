"use client";
import { useState, useEffect, useCallback } from "react";
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
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiButton from "@mui/material/Button";
import MuiSelect from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiTextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { Plus, Edit2, Trash2, Tag, Search, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  merchant?: { name: string };
}
interface Merchant { id: string; name: string }

const empty: Partial<Offer> = { title: "", discount: "", description: "", terms: "", merchantId: "", isActive: true };

export default function AdminOffersPage() {
  const [offers, setOffers]       = useState<Offer[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState<Offer | null>(null);
  const [form, setForm]           = useState<Partial<Offer>>(empty);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, m] = await Promise.all([
      fetch("/api/offers").then((r) => r.json()),
      fetch("/api/merchants?limit=200").then((r) => r.json()),
    ]);
    setOffers(o);
    setMerchants(m.merchants || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ ...empty, merchantId: merchants[0]?.id }); setOpen(true); };
  const openEdit   = (o: Offer) => { setEditing(o); setForm(o); setOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/api/offers/${editing.id}` : "/api/offers";
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.merchant?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>Offers</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{offers.length} total</Typography>
        </Box>
        <MuiButton variant="contained" startIcon={<Plus size={16} />} onClick={openCreate} disabled={merchants.length === 0} sx={{ borderRadius: "10px" }}>
          Add Offer
        </MuiButton>
      </Box>

      <TextField
        placeholder="Search offers…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 320, mb: 3 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
      />

      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box py={8} textAlign="center" color="text.secondary">Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box py={8} textAlign="center" color="text.secondary">
            <Tag size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No offers found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell><Typography variant="body2" fontWeight={500}>{o.title}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{o.merchant?.name || "—"}</Typography></TableCell>
                  <TableCell>
                    {o.discount
                      ? <Chip label={o.discount} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.72rem" }} />
                      : <Typography variant="body2" color="text.secondary">—</Typography>}
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{o.validUntil ? formatDate(o.validUntil) : "No expiry"}</Typography></TableCell>
                  <TableCell>
                    <Chip label={o.isActive ? "Active" : "Inactive"} size="small" sx={{ bgcolor: o.isActive ? "#d1fae5" : "#f1f5f9", color: o.isActive ? "#065f46" : "#475569", fontWeight: 600, fontSize: "0.72rem" }} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(o)}><Edit2 size={16} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(o.id)}><Trash2 size={16} /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
          {editing ? "Edit Offer" : "Add Offer"}
          <IconButton size="small" onClick={() => setOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Merchant *</InputLabel>
            <MuiSelect native label="Merchant *" value={form.merchantId || ""} onChange={(e) => setForm({ ...form, merchantId: e.target.value as string })}>
              {merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </MuiSelect>
          </FormControl>
          <MuiTextField label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" fullWidth />
          <MuiTextField label="Discount label" value={form.discount || ""} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="e.g. 20% OFF" size="small" fullWidth />
          <MuiTextField label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} size="small" fullWidth />
          <MuiTextField label="Terms & Conditions" value={form.terms || ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} multiline rows={2} size="small" fullWidth />
          <MuiTextField label="Valid until (optional)" type="date" value={form.validUntil ? String(form.validUntil).slice(0, 10) : ""} onChange={(e) => setForm({ ...form, validUntil: e.target.value || null })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <MuiButton variant="text" onClick={() => setOpen(false)}>Cancel</MuiButton>
          <MuiButton variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined} sx={{ borderRadius: "10px" }}>
            {editing ? "Save changes" : "Create offer"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
