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
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Headphones,
  Search,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  MessageSquare,
  User,
  Crown,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomerRelation {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  subscription?: {
    plan: string;
    status: string;
  } | null;
}

interface SupportTicket {
  id: number;
  customerId: number | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerRelation | null;
}

interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/support?limit=100&status=${statusTab}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [statusTab, search]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditAdminNotes(ticket.adminNotes || "");
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editAdminNotes,
          sendEmail: sendEmailNotification,
          replyMessage: editAdminNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? data.ticket : t))
        );
        setSnackbar({
          open: true,
          message: `Ticket #${selectedTicket.id} updated successfully`,
          severity: "success",
        });
        handleCloseDialog();
        loadTickets();
      } else {
        const err = await res.json();
        setSnackbar({
          open: true,
          message: err.error || "Failed to update ticket",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Chip label="Pending" size="small" sx={{ bgcolor: "#fef3c7", color: "#d97706", fontWeight: 600 }} />;
      case "IN_PROGRESS":
        return <Chip label="In Progress" size="small" sx={{ bgcolor: "#dbeafe", color: "#2563eb", fontWeight: 600 }} />;
      case "RESOLVED":
        return <Chip label="Resolved" size="small" sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 600 }} />;
      case "CLOSED":
        return <Chip label="Closed" size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Headphones size={26} color="#4f46e5" />
            Support Messages & Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage client support requests, reach out via email or phone, and log internal staff notes.
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                Total Tickets
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {stats.total}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#e0e7ff", color: "#4f46e5" }}>
              <MessageSquare size={22} />
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                Pending Review
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#d97706" }}>
                {stats.pending}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#fef3c7", color: "#d97706" }}>
              <Clock size={22} />
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                In Progress
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#2563eb" }}>
                {stats.inProgress}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#dbeafe", color: "#2563eb" }}>
              <AlertCircle size={22} />
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                Resolved
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#16a34a" }}>
                {stats.resolved}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#dcfce7", color: "#16a34a" }}>
              <CheckCircle2 size={22} />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Main Table Container */}
      <Paper sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        {/* Filter and Search Bar */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={statusTab}
            onChange={(_, val) => setStatusTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600 } }}
          >
            <Tab label={`All (${stats.total})`} value="all" />
            <Tab label={`Pending (${stats.pending})`} value="PENDING" />
            <Tab label={`In Progress (${stats.inProgress})`} value="IN_PROGRESS" />
            <Tab label={`Resolved (${stats.resolved})`} value="RESOLVED" />
            <Tab label={`Closed (${stats.closed})`} value="CLOSED" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search member, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#94a3b8" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 260 }}
          />
        </Box>

        {/* Table Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <Headphones size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
              No support tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {search ? "Try adjusting your search criteria" : "New support requests from member clients will appear here."}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Sender / Member</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Subject & Inquiry</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Received At</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={t.customer?.imageUrl || undefined}
                        sx={{ width: 38, height: 38, bgcolor: "#4f46e5", fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t.name}
                        </Typography>
                        {t.customer?.subscription ? (
                          <Chip
                            icon={<Crown size={12} />}
                            label={t.customer.subscription.plan}
                            size="small"
                            sx={{ height: 20, fontSize: "0.6875rem", bgcolor: "#fef3c7", color: "#b45309", fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t.customerId ? "Registered Member" : "Guest Inquiry"}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.message}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                        <Mail size={14} />
                        <Typography variant="body2">{t.email}</Typography>
                      </Box>
                      {t.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                          <Phone size={14} />
                          <Typography variant="body2">{t.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>{getStatusChip(t.status)}</TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(t.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenTicket(t)}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      View & Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Ticket Details & Reach-out Dialog */}
      <Dialog open={Boolean(selectedTicket)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Headphones size={22} color="#4f46e5" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Ticket #{selectedTicket.id}: {selectedTicket.subject}
                </Typography>
              </Box>
              {getStatusChip(editStatus)}
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Sender Card */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={selectedTicket.customer?.imageUrl || undefined}
                        sx={{ width: 48, height: 48, bgcolor: "#4f46e5", fontWeight: 700 }}
                      >
                        {selectedTicket.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {selectedTicket.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submitted on {formatDate(selectedTicket.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Quick Reach-Out Actions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Button
                        component="a"
                        href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                        variant="outlined"
                        size="small"
                        startIcon={<Mail size={16} />}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                      >
                        Send Email
                      </Button>
                      {selectedTicket.phone && (
                        <Button
                          component="a"
                          href={`tel:${selectedTicket.phone}`}
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<Phone size={16} />}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          Call Phone
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>

                {/* Message Body */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Message Content
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2.5, mt: 1, borderRadius: 2.5, whiteSpace: "pre-wrap", bgcolor: "#ffffff" }}>
                    <Typography variant="body1" sx={{ color: "#334155", lineHeight: 1.6 }}>
                      {selectedTicket.message}
                    </Typography>
                  </Paper>
                </Box>

                {/* Ticket Status & Admin Reach-out Notes */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                    Backend Staff Management
                  </Typography>

                  <FormControl fullWidth size="small">
                    <InputLabel id="ticket-status-label">Update Ticket Status</InputLabel>
                    <Select
                      labelId="ticket-status-label"
                      value={editStatus}
                      label="Update Ticket Status"
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <MenuItem value="PENDING">Pending (New Request)</MenuItem>
                      <MenuItem value="IN_PROGRESS">In Progress (Staff Reached Out)</MenuItem>
                      <MenuItem value="RESOLVED">Resolved</MenuItem>
                      <MenuItem value="CLOSED">Closed</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Staff Response / Reach-Out Notes"
                    multiline
                    rows={3}
                    placeholder="Type response to member or internal notes..."
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    fullWidth
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sendEmailNotification}
                        onChange={(e) => setSendEmailNotification(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={`Send automated response email to customer (${selectedTicket.email})`}
                  />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveTicket}
                variant="contained"
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#4f46e5",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
              >
                {saving ? "Saving Changes..." : "Save Updates"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Toast Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
