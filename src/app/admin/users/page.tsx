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
import Avatar from "@mui/material/Avatar";
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
import { Users, Search, Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Role = "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "SALESMAN";

interface StaffUser {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

const ROLES: { value: Role; label: string; color: string; bg: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin", color: "#92400e", bg: "#fef3c7" },
  { value: "ADMIN",       label: "Admin",       color: "#3730a3", bg: "#e0e7ff" },
  { value: "ACCOUNTANT",  label: "Accountant",  color: "#065f46", bg: "#d1fae5" },
  { value: "SALESMAN",    label: "Sales",       color: "#1e40af", bg: "#dbeafe" },
];

const roleStyle = (role: Role) =>
  ROLES.find((r) => r.value === role) ?? { label: role, color: "#475569", bg: "#f1f5f9" };

const EMPTY_FORM = { name: "", email: "", password: "", role: "ADMIN" as Role };

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<StaffUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<StaffUser | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);

  const [deleteId, setDeleteId]     = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/users?limit=100");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        return matchSearch && matchRole;
      }),
    [users, search, roleFilter]
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setDialogOpen(true);
  };

  const openEdit = (u: StaffUser) => {
    setEditing(u);
    setForm({ name: u.name ?? "", email: u.email, password: "", role: u.role });
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
    setSaving(true);
    setSaveError(null);

    const url    = editing ? `/api/users/${editing.id}` : "/api/users";
    const method = editing ? "PUT" : "POST";
    const payload = editing
      ? { name: form.name, role: form.role }
      : { name: form.name, email: form.email, password: form.password, role: form.role };

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setSaveError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }
    setSaving(false);
    closeDialog();
    load();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

  const roleCounts = ROLES.map((r) => ({
    ...r,
    count: users.filter((u) => u.role === r.value).length,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {users.length} staff accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={openAdd}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
        >
          Add User
        </Button>
      </Box>

      {/* Role summary chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {roleCounts.map((r) => (
          <Chip
            key={r.value}
            icon={<ShieldCheck size={13} color={r.color} />}
            label={`${r.label} · ${r.count}`}
            onClick={() => setRoleFilter(roleFilter === r.value ? "all" : r.value)}
            variant={roleFilter === r.value ? "filled" : "outlined"}
            sx={{
              fontWeight: 600, fontSize: "0.75rem",
              bgcolor: roleFilter === r.value ? r.bg : "transparent",
              color: roleFilter === r.value ? r.color : "text.secondary",
              borderColor: r.bg,
              cursor: "pointer",
              "& .MuiChip-icon": { ml: "6px" },
            }}
          />
        ))}
        {roleFilter !== "all" && (
          <Chip
            label="Clear filter"
            size="small"
            onClick={() => setRoleFilter("all")}
            sx={{ fontSize: "0.72rem", color: "text.disabled", cursor: "pointer" }}
          />
        )}
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by name or email…"
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
            <Users size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No users found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 600, fontSize: "0.8rem", color: "text.secondary", bgcolor: "#f8fafc" } }}>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const rs = roleStyle(u.role);
                return (
                  <TableRow key={u.id} hover>
                    {/* User */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, bgcolor: rs.bg, color: rs.color }}>
                          {(u.name ?? u.email)[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name || "—"}</Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        icon={<ShieldCheck size={12} color={rs.color} />}
                        label={rs.label}
                        size="small"
                        sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 600, fontSize: "0.72rem", "& .MuiChip-icon": { ml: "6px" } }}
                      />
                    </TableCell>

                    {/* Joined */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(u.createdAt)}</Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: "#4f46e5", mr: 0.5 }}>
                        <Pencil size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteId(u.id)} sx={{ color: "#ef4444" }}>
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
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit User" : "Add Staff User"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth size="small"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            fullWidth size="small" type="email" required
            disabled={!!editing}
          />
          {!editing && (
            <TextField
              label="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              fullWidth size="small" type="password" required
            />
          )}
          <FormControl fullWidth size="small" required>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: r.color }} />
                    {r.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {saveError && (
            <Typography variant="body2" color="error">{saveError}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.email || (!editing && !form.password)}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone. Are you sure?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
