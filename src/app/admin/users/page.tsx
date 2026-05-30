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
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import { Users, Search, Crown, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string; endDate: string } | null;
  _count: { redemptions: number };
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  ADMIN:           { color: "#065f46", bg: "#d1fae5" },
  PAID_SUBSCRIBER: { color: "#92400e", bg: "#fef3c7" },
  REGISTERED:      { color: "#4338ca", bg: "#e0e7ff" },
  GUEST:           { color: "#475569", bg: "#f1f5f9" },
};

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/users?limit=100").then((r) => r.json());
    setUsers(data.users || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (role: string) =>
    ({ ADMIN: "Admin", PAID_SUBSCRIBER: "Subscriber", REGISTERED: "Registered", GUEST: "Guest" }[role] ?? role);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{users.length} total</Typography>
        </Box>
      </Box>

      <TextField
        placeholder="Search users…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 320, mb: 3 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

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
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell align="center">Redemptions</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.GUEST;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }}>
                          {(u.name || u.email)[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name || "—"}</Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={u.role === "ADMIN" ? <Shield size={12} /> : u.role === "PAID_SUBSCRIBER" ? <Crown size={12} /> : undefined}
                        label={roleLabel(u.role)}
                        size="small"
                        sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      {u.subscription ? (
                        <Box>
                          <Chip label={u.subscription.plan} size="small" sx={{ bgcolor: u.subscription.status === "ACTIVE" ? "#d1fae5" : "#f1f5f9", color: u.subscription.status === "ACTIVE" ? "#065f46" : "#475569", fontWeight: 600, fontSize: "0.72rem", mb: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Exp. {formatDate(u.subscription.endDate)}</Typography>
                        </Box>
                      ) : <Typography variant="body2" color="text.secondary">—</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u._count.redemptions}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(u.createdAt)}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
