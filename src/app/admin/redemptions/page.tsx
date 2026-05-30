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
import InputAdornment from "@mui/material/InputAdornment";
import { Receipt, Search, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Redemption {
  id: string;
  savings: number;
  redeemedAt: string;
  user: { name: string | null; email: string };
  merchant: { name: string };
  offer: { title: string; discount: string | null };
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/redemptions?limit=100").then((r) => r.json());
    setRedemptions(data.redemptions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = redemptions.filter(
    (r) =>
      r.user.email.toLowerCase().includes(search.toLowerCase()) ||
      r.merchant.name.toLowerCase().includes(search.toLowerCase()) ||
      r.offer.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalSavings = redemptions.reduce((s, r) => s + r.savings, 0);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Redemptions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{redemptions.length} total</Typography>
        </Box>
        <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderRadius: 3, borderColor: "divider" }}>
          <TrendingUp size={18} color="#10b981" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Total Savings: {formatCurrency(totalSavings)}
          </Typography>
        </Paper>
      </Box>

      <TextField
        placeholder="Search redemptions…"
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
            <Receipt size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No redemptions found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Offer</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Savings</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.user.name || r.user.email}</Typography>
                    {r.user.name && <Typography variant="caption" color="text.secondary">{r.user.email}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.offer.title}</Typography>
                    {r.offer.discount && <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 600 }}>{r.offer.discount}</Typography>}
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{r.merchant.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(r.savings)}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{formatDate(r.redeemedAt)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
