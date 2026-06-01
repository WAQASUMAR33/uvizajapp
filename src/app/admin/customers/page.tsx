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
import { Users, Search, Crown, Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string | null;
  nationality: string | null;
  gender: string | null;
  logType: string;
  createdAt: string;
  subscription: { plan: string; status: string; endDate: string; price: number; currency: string } | null;
  _count: { redemptions: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/customers?limit=100").then((r) => r.json());
    setCustomers(data.customers || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.fullname.toLowerCase().includes(search.toLowerCase()) ||
      (c.phoneNumber || "").includes(search)
  );

  const activeCount = customers.filter((c) => c.subscription?.status === "ACTIVE").length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Customers</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {customers.length} total &nbsp;·&nbsp;
            <Box component="span" sx={{ color: "#065f46", fontWeight: 600 }}>{activeCount} active subscribers</Box>
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by name, email or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 360, mb: 3 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <Users size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <Typography variant="body2">No customers found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 600, fontSize: "0.8rem", color: "text.secondary", bgcolor: "#f8fafc" } }}>
                <TableCell>Customer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Nationality</TableCell>
                <TableCell>Login Type</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell align="center">Redemptions</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} hover>
                  {/* Customer */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }}>
                        {c.fullname[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.fullname}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <Typography variant="body2" color={c.phoneNumber ? "text.primary" : "text.disabled"}>
                      {c.phoneNumber || "—"}
                    </Typography>
                  </TableCell>

                  {/* Nationality */}
                  <TableCell>
                    <Typography variant="body2" color={c.nationality ? "text.primary" : "text.disabled"}>
                      {c.nationality || "—"}
                    </Typography>
                  </TableCell>

                  {/* Login type */}
                  <TableCell>
                    <Chip
                      label={c.logType}
                      size="small"
                      sx={{ fontSize: "0.72rem", fontWeight: 600, bgcolor: "#f1f5f9", color: "#475569", textTransform: "capitalize" }}
                    />
                  </TableCell>

                  {/* Subscription */}
                  <TableCell>
                    {c.subscription ? (
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                          <Crown size={12} color="#f59e0b" />
                          <Chip
                            label={`${c.subscription.plan} · ${c.subscription.status}`}
                            size="small"
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              bgcolor: c.subscription.status === "ACTIVE" ? "#d1fae5" : "#f1f5f9",
                              color:   c.subscription.status === "ACTIVE" ? "#065f46" : "#475569",
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Exp. {formatDate(c.subscription.endDate)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled">No subscription</Typography>
                    )}
                  </TableCell>

                  {/* Redemptions */}
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      <Receipt size={14} color="#94a3b8" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c._count.redemptions}</Typography>
                    </Box>
                  </TableCell>

                  {/* Joined */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{formatDate(c.createdAt)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
