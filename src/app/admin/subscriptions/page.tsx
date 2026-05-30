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
import InputAdornment from "@mui/material/InputAdornment";
import { CreditCard, Search, Crown } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Sub {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  platform: string | null;
  customer: { fullname: string; email: string };
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: "#d1fae5", color: "#065f46" },
  EXPIRED:   { bg: "#fee2e2", color: "#991b1b" },
  CANCELLED: { bg: "#f1f5f9", color: "#475569" },
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/subscriptions/list").then((r) => r.json());
    setSubs(data.subscriptions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subs.filter(
    (s) =>
      s.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.fullname.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = subs.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.price, 0);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Subscriptions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subs.filter((s) => s.status === "ACTIVE").length} active
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderRadius: 3, borderColor: "divider" }}>
          <CreditCard size={18} color="#4f46e5" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Revenue: {formatCurrency(totalRevenue)}</Typography>
        </Paper>
      </Box>

      <TextField
        placeholder="Search subscribers…"
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
            <Crown size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No subscriptions found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Platform</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => {
                const sc = STATUS_COLORS[s.status] ?? STATUS_COLORS.CANCELLED;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.customer.fullname || s.customer.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.customer.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<Crown size={12} />} label={s.plan} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: "0.72rem" }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={s.status} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: "0.72rem" }} />
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(s.price, s.currency)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{formatDate(s.endDate)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>{s.platform || "web"}</Typography></TableCell>
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
