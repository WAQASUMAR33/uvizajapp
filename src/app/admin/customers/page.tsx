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
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { Users, Search, Crown } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Subscription {
  plan: string;
  status: string;
  endDate: string;
  price: number;
  currency: string;
}

interface Customer {
  id: number;
  fullname: string;
  email: string;
  uid: string | null;
  logType: string;
  phoneNumber: string | null;
  nationality: string | null;
  gender: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  subscription: Subscription | null;
}

type StatusFilter = "all" | "active" | "inactive";

export default function AdminCustomersPage() {
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [toggling, setToggling]     = useState<number | null>(null);

  const load = useCallback(async (status: StatusFilter = "all") => {
    setLoading(true);
    const res  = await fetch(`/api/customers?limit=100&status=${status}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.fullname.toLowerCase().includes(search.toLowerCase()) ||
          (c.phoneNumber ?? "").includes(search)
      ),
    [customers, search]
  );

  const handleToggleStatus = async (customer: Customer) => {
    setToggling(customer.id);
    const newActive = !customer.isActive;
    const res = await fetch("/api/customers/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, isActive: newActive }),
    });
    if (res.ok) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, isActive: newActive } : c))
      );
    }
    setToggling(null);
  };

  const totalActive   = customers.filter((c) => c.isActive).length;
  const totalInactive = customers.filter((c) => !c.isActive).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Customers</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {customers.length} total &nbsp;·&nbsp;
            <Box component="span" sx={{ color: "#065f46", fontWeight: 600 }}>{totalActive} active</Box>
            &nbsp;·&nbsp;
            <Box component="span" sx={{ color: "#b91c1c", fontWeight: 600 }}>{totalInactive} inactive</Box>
          </Typography>
        </Box>
      </Box>

      {/* Filters row */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
        <TextField
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 320 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
        />

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          size="small"
          onChange={(_, val) => { if (val) setStatusFilter(val); }}
          sx={{ ".MuiToggleButton-root": { textTransform: "none", fontWeight: 600, px: 2 } }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
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
                <TableCell>Joined</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} hover sx={{ opacity: c.isActive ? 1 : 0.6 }}>

                  {/* Customer */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }}>
                        {c.fullname[0]?.toUpperCase() ?? "?"}
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

                  {/* Joined */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{formatDate(c.createdAt)}</Typography>
                  </TableCell>

                  {/* Active toggle */}
                  <TableCell align="center">
                    <Tooltip title={c.isActive ? "Click to deactivate" : "Click to activate"}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        <Switch
                          checked={c.isActive}
                          disabled={toggling === c.id}
                          onChange={() => handleToggleStatus(c)}
                          size="small"
                          color="success"
                        />
                        <Chip
                          label={c.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={
                            c.isActive
                              ? { bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }
                              : { bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: "0.72rem" }
                          }
                        />
                      </Box>
                    </Tooltip>
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
