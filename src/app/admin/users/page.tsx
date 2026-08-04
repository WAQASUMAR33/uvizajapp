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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Divider from "@mui/material/Divider";
import {
  Users, Search, Plus, Pencil, Trash2, ShieldCheck,
  CheckCircle2, XCircle, Crown, Shield, Briefcase, Calculator,
  Lock, Eye, EyeOff, Key, ArrowRight, ArrowLeft, Check, UserPlus
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type SystemRoleEnum = "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "SALESMAN";

interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
}

interface StaffUser {
  id: number;
  name: string | null;
  email: string;
  role: SystemRoleEnum;
  roleId: number | null;
  roleName?: string;
  permissions: string[] | null;
  rolePermissions: string[] | null;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { key: "dashboard",             label: "Dashboard Analytics",    icon: "📊", description: "View overall dashboard metrics & summary statistics" },
  { key: "merchants",             label: "Merchant Management",    icon: "🏪", description: "Add, edit, view and manage restaurant & merchant listings" },
  { key: "categories",            label: "Category Management",   icon: "🏷️", description: "Manage dining categories, images and tags" },
  { key: "offers",                label: "Offer Management",      icon: "🎁", description: "Create, edit, view and manage merchant deals & discount offers" },
  { key: "customers",             label: "Customer Accounts",     icon: "👥", description: "View registered users, subscriber details and profiles" },
  { key: "support",               label: "Support Messages",      icon: "🎧", description: "Read, manage, and respond to member support messages & tickets" },
  { key: "redemptions",           label: "Redemptions Audit",     icon: "🎟️", description: "Audit offer redemptions history and claims" },
  { key: "subscriptions",         label: "Subscriptions & Billing",icon: "💳", description: "Manage customer subscriptions, plans and payment statuses" },
  { key: "subscription_packages", label: "Subscription Packages", icon: "📦", description: "Configure pricing tiers and subscription packages" },
  { key: "terms",                 label: "Terms & Conditions",    icon: "📄", description: "Update legal terms and privacy policies" },
  { key: "users",                 label: "Users & Role Management",icon: "🛡️", description: "Create staff accounts, custom roles and assign permissions" },
];

const DEFAULT_FORM = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN" as SystemRoleEnum,
  roleId: "" as number | "",
  customPermissions: [] as string[],
  overridePermissions: false,
};

const DEFAULT_ROLE_FORM = {
  name: "",
  description: "",
  permissions: ["dashboard"] as string[],
};

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<StaffUser[]>([]);
  const [roles, setRoles]           = useState<RoleItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab]   = useState(0);

  // User Wizard Dialog State
  const [userDialogOpen, setUserDialogOpen]   = useState(false);
  const [userStep, setUserStep]               = useState(0); // 0: Enter User Info, 1: Select Role & Assign Permissions
  const [editingUser, setEditingUser]         = useState<StaffUser | null>(null);
  const [userForm, setUserForm]               = useState(DEFAULT_FORM);
  const [showPassword, setShowPassword]       = useState(false);
  const [userSaving, setUserSaving]           = useState(false);
  const [userSaveError, setUserSaveError]     = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId]       = useState<number | null>(null);

  // Custom Role Dialog State
  const [roleDialogOpen, setRoleDialogOpen]   = useState(false);
  const [editingRole, setEditingRole]         = useState<RoleItem | null>(null);
  const [roleForm, setRoleForm]               = useState(DEFAULT_ROLE_FORM);
  const [roleSaving, setRoleSaving]           = useState(false);
  const [roleSaveError, setRoleSaveError]     = useState<string | null>(null);
  const [deleteRoleId, setDeleteRoleId]       = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/roles"),
      ]);
      const uData = await uRes.json();
      const rData = await rRes.json();
      setUsers(uData.users || []);
      setRoles(rData.roles || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered Users
  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || u.role === roleFilter || String(u.roleId) === roleFilter;
        return matchSearch && matchRole;
      }),
    [users, search, roleFilter]
  );

  // --- USER CREATION WORKFLOW HANDLERS ---
  const openAddUser = () => {
    setEditingUser(null);
    const defaultRole = roles.find((r) => r.name.toLowerCase() === "admin") || roles[0];
    
    setUserForm({
      ...DEFAULT_FORM,
      roleId: defaultRole ? defaultRole.id : "",
      role: defaultRole ? (defaultRole.name.toUpperCase().replace(/\s+/g, "_") as SystemRoleEnum) : "ADMIN",
      customPermissions: defaultRole ? defaultRole.permissions : ["dashboard"],
      overridePermissions: true,
    });
    setUserStep(0);
    setShowPassword(false);
    setUserSaveError(null);
    setUserDialogOpen(true);
  };

  const openEditUser = (u: StaffUser) => {
    setEditingUser(u);
    setUserStep(0);
    const assignedRole = roles.find((r) => r.id === u.roleId || r.name.toLowerCase() === u.role.toLowerCase());
    const initialPerms = u.permissions || u.rolePermissions || assignedRole?.permissions || [];

    setUserForm({
      name: u.name ?? "",
      email: u.email,
      password: "",
      role: u.role,
      roleId: u.roleId ?? (assignedRole ? assignedRole.id : ""),
      customPermissions: initialPerms,
      overridePermissions: Array.isArray(u.permissions) && u.permissions.length > 0,
    });
    setShowPassword(false);
    setUserSaveError(null);
    setUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
    setUserStep(0);
    setUserForm(DEFAULT_FORM);
    setUserSaveError(null);
  };

  const handleSelectRoleInWizard = (roleIdOrName: number | string) => {
    const matchRole = roles.find((r) => String(r.id) === String(roleIdOrName) || r.name.toUpperCase() === String(roleIdOrName).toUpperCase());
    
    if (matchRole) {
      setUserForm((prev) => ({
        ...prev,
        roleId: matchRole.id,
        role: (matchRole.name.toUpperCase().replace(/\s+/g, "_") as SystemRoleEnum),
        customPermissions: matchRole.permissions,
        overridePermissions: true,
      }));
    } else {
      setUserForm((prev) => ({
        ...prev,
        roleId: "",
        role: roleIdOrName as SystemRoleEnum,
        customPermissions: ["dashboard"],
        overridePermissions: true,
      }));
    }
  };

  const handleSaveUser = async () => {
    setUserSaving(true);
    setUserSaveError(null);

    const url    = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
    const method = editingUser ? "PUT" : "POST";

    const payload: any = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      roleId: userForm.roleId ? Number(userForm.roleId) : null,
      permissions: userForm.customPermissions,
    };

    if (userForm.password) {
      payload.password = userForm.password;
    }

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setUserSaveError(data.error ?? "Save failed");
        setUserSaving(false);
        return;
      }
      setUserSaving(false);
      closeUserDialog();
      loadData();
    } catch {
      setUserSaveError("Failed to create user account");
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteUserId === null) return;
    try {
      await fetch(`/api/users/${deleteUserId}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    setDeleteUserId(null);
    loadData();
  };

  // --- ROLE HANDLERS ---
  const openAddRole = () => {
    setEditingRole(null);
    setRoleForm(DEFAULT_ROLE_FORM);
    setRoleSaveError(null);
    setRoleDialogOpen(true);
  };

  const openEditRole = (r: RoleItem) => {
    setEditingRole(r);
    setRoleForm({
      name: r.name,
      description: r.description ?? "",
      permissions: r.permissions || [],
    });
    setRoleSaveError(null);
    setRoleDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setEditingRole(null);
    setRoleForm(DEFAULT_ROLE_FORM);
    setRoleSaveError(null);
  };

  const handleSaveRole = async () => {
    setRoleSaving(true);
    setRoleSaveError(null);

    const url    = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
    const method = editingRole ? "PUT" : "POST";

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setRoleSaveError(data.error ?? "Save failed");
        setRoleSaving(false);
        return;
      }
      setRoleSaving(false);
      closeRoleDialog();
      loadData();
    } catch {
      setRoleSaveError("Failed to save role");
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (deleteRoleId === null) return;
    try {
      await fetch(`/api/roles/${deleteRoleId}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    setDeleteRoleId(null);
    loadData();
  };

  const toggleRolePermission = (permKey: string) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(permKey);
      const updated = exists
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: updated };
    });
  };

  const toggleUserPermissionInWizard = (permKey: string) => {
    setUserForm((prev) => {
      const exists = prev.customPermissions.includes(permKey);
      const updated = exists
        ? prev.customPermissions.filter((p) => p !== permKey)
        : [...prev.customPermissions, permKey];
      return { ...prev, customPermissions: updated };
    });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Custom Roles & User Permissions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create user accounts, assign dynamic roles, and configure granular permissions
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Key size={16} />}
            onClick={openAddRole}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#6366f1", color: "#6366f1" }}
          >
            Create Custom Role
          </Button>
          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={openAddUser}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            Create User Account
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
            "& .Mui-selected": { color: "#4f46e5" },
            "& .MuiTabs-indicator": { backgroundColor: "#4f46e5" },
          }}
        >
          <Tab label={`Staff Accounts (${users.length})`} />
          <Tab label={`Custom Roles (${roles.length})`} />
          <Tab label="Permissions Matrix" />
        </Tabs>
      </Box>

      {/* --- TAB 0: STAFF ACCOUNTS --- */}
      {activeTab === 0 && (
        <>
          {/* Role filter chips */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            <Chip
              label={`All Accounts (${users.length})`}
              onClick={() => setRoleFilter("all")}
              variant={roleFilter === "all" ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: 2, bgcolor: roleFilter === "all" ? "#4f46e5" : "transparent", color: roleFilter === "all" ? "#fff" : "text.secondary" }}
            />
            {roles.map((r) => (
              <Chip
                key={r.id}
                label={`${r.name} (${users.filter((u) => u.roleId === r.id || u.roleName === r.name || u.role === r.name).length})`}
                onClick={() => setRoleFilter(roleFilter === String(r.id) ? "all" : String(r.id))}
                variant={roleFilter === String(r.id) ? "filled" : "outlined"}
                sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: 2 }}
              />
            ))}
          </Box>

          {/* Search bar */}
          <TextField
            placeholder="Search by user name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ maxWidth: 360, mb: 3 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
          />

          {/* Users Table */}
          <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
            {loading ? (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>Loading staff accounts…</Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                <Users size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
                <Typography variant="body2">No user accounts found matching your query</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 600, fontSize: "0.8rem", color: "text.secondary", bgcolor: "#f8fafc" } }}>
                    <TableCell>User</TableCell>
                    <TableCell>Assigned Role</TableCell>
                    <TableCell>Active Permissions</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const assignedRole = roles.find((r) => r.id === u.roleId || r.name.toLowerCase() === u.role.toLowerCase());
                    const activePerms = u.permissions || u.rolePermissions || assignedRole?.permissions || [];
                    const isCustomOverridden = Array.isArray(u.permissions) && u.permissions.length > 0;

                    return (
                      <TableRow key={u.id} hover>
                        {/* User Profile */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, fontSize: "0.9rem", fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }}>
                              {(u.name ?? u.email)[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name || "—"}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Assigned Role */}
                        <TableCell>
                          <Chip
                            icon={<ShieldCheck size={13} color="#4f46e5" />}
                            label={assignedRole ? assignedRole.name : u.role}
                            size="small"
                            sx={{ bgcolor: "#e0e7ff", color: "#3730a3", fontWeight: 600, fontSize: "0.75rem", borderRadius: 1.5 }}
                          />
                        </TableCell>

                        {/* Permissions Badges */}
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", maxWidth: 280 }}>
                            {activePerms.length === AVAILABLE_PERMISSIONS.length ? (
                              <Chip label="Full Access (All Modules)" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontSize: "0.7rem", fontWeight: 600 }} />
                            ) : (
                              activePerms.map((p) => (
                                <Chip
                                  key={p}
                                  label={p}
                                  size="small"
                                  sx={{ fontSize: "0.68rem", height: 20, bgcolor: "#f1f5f9", color: "#475569" }}
                                />
                              ))
                            )}
                            {isCustomOverridden && (
                              <Chip label="Custom Overridden" size="small" sx={{ fontSize: "0.68rem", height: 20, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }} />
                            )}
                          </Box>
                        </TableCell>

                        {/* Date Created */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{formatDate(u.createdAt)}</Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEditUser(u)} sx={{ color: "#4f46e5", mr: 0.5 }}>
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteUserId(u.id)} sx={{ color: "#ef4444" }}>
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
        </>
      )}

      {/* --- TAB 1: CUSTOM ROLES MANAGER --- */}
      {activeTab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Defined Roles & Permissions</Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={openAddRole}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
            >
              Create New Role
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
            {roles.map((roleItem) => {
              const assignedUserCount = users.filter((u) => u.roleId === roleItem.id || u.role === roleItem.name).length;

              return (
                <Card key={roleItem.id} variant="outlined" sx={{ borderRadius: 3, borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: roleItem.isSystem ? "#fef3c7" : "#e0e7ff", color: roleItem.isSystem ? "#92400e" : "#4338ca", width: 38, height: 38 }}>
                          {roleItem.isSystem ? <Crown size={18} /> : <Key size={18} />}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{roleItem.name}</Typography>
                            {roleItem.isSystem ? (
                              <Chip label="System Built-in" size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontSize: "0.7rem", fontWeight: 700 }} />
                            ) : (
                              <Chip label="Custom Role" size="small" sx={{ bgcolor: "#e0e7ff", color: "#4338ca", fontSize: "0.7rem", fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Assigned to {assignedUserCount} staff account{assignedUserCount === 1 ? "" : "s"}
                          </Typography>
                        </Box>
                      </Box>

                      {!roleItem.isSystem && (
                        <Box>
                          <IconButton size="small" onClick={() => openEditRole(roleItem)} sx={{ color: "#4f46e5", mr: 0.5 }}>
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteRoleId(roleItem.id)} sx={{ color: "#ef4444" }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {roleItem.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.85rem" }}>
                        {roleItem.description}
                      </Typography>
                    )}

                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                      PERMISSIONS ({roleItem.permissions.length}):
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {roleItem.permissions.map((perm) => {
                        const info = AVAILABLE_PERMISSIONS.find((p) => p.key === perm);
                        return (
                          <Chip
                            key={perm}
                            label={`${info?.icon || "•"} ${info?.label || perm}`}
                            size="small"
                            sx={{ fontSize: "0.72rem", bgcolor: "#f8fafc", borderColor: "divider", border: "1px solid" }}
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* --- TAB 2: PERMISSIONS MATRIX --- */}
      {activeTab === 2 && (
        <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>System Access Control Matrix</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
              Granular breakdown of module permissions assigned across all defined roles
            </Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, fontSize: "0.8rem", color: "text.secondary" } }}>
                <TableCell>Module / Feature</TableCell>
                {roles.map((r) => (
                  <TableCell key={r.id} align="center">{r.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <TableRow key={perm.key} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{perm.icon}</span>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{perm.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{perm.description}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {roles.map((r) => {
                    const hasPerm = r.permissions.includes(perm.key);
                    return (
                      <TableCell key={r.id} align="center">
                        {hasPerm ? (
                          <CheckCircle2 size={18} color="#10b981" style={{ margin: "auto" }} />
                        ) : (
                          <XCircle size={18} color="#94a3b8" style={{ margin: "auto" }} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* --- USER CREATION & ROLE ASSIGNMENT WIZARD DIALOG --- */}
      <Dialog open={userDialogOpen} onClose={closeUserDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingUser ? "Edit User Account & Roles" : "Create New User Account"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: "12px !important" }}>
          {/* Stepper Header */}
          <Stepper activeStep={userStep} alternativeLabel sx={{ mb: 1 }}>
            <Step>
              <StepLabel>1. User Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>2. Assign Roles & Permissions</StepLabel>
            </Step>
          </Stepper>

          <Divider sx={{ borderStyle: "dashed" }} />

          {/* STEP 1: ENTER USER INFORMATION */}
          {userStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Step 1: Enter User Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Provide user details and set authentication credentials
                </Typography>
              </Box>

              <TextField
                label="Full Name"
                value={userForm.name}
                onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth size="small"
                placeholder="e.g. John Doe"
              />

              <TextField
                label="Email Address"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                fullWidth size="small" type="email" required
                disabled={!!editingUser}
                placeholder="user@ujivaj.com"
              />

              <TextField
                label={editingUser ? "New Password (Optional)" : "Password"}
                value={userForm.password}
                onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                fullWidth size="small"
                type={showPassword ? "text" : "password"}
                required={!editingUser}
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter account password"}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><Lock size={16} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          )}

          {/* STEP 2: SELECT ROLES TO ASSIGN WITH PERMISSIONS */}
          {userStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Step 2: Select Role to Assign & Configure Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assign a system/custom role and customize specific module access for this user
                </Typography>
              </Box>

              {/* Role Selector */}
              <FormControl fullWidth size="small" required>
                <InputLabel>Select Role to Assign</InputLabel>
                <Select
                  label="Select Role to Assign"
                  value={userForm.roleId || userForm.role}
                  onChange={(e) => handleSelectRoleInWizard(e.target.value)}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id} sx={{ py: 1.2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                        {r.description && <Typography variant="caption" color="text.secondary">{r.description}</Typography>}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Permissions Checklist */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Assigned Module Permissions ({userForm.customPermissions.length}/{AVAILABLE_PERMISSIONS.length})
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setUserForm((f) => ({ ...f, customPermissions: AVAILABLE_PERMISSIONS.map((p) => p.key) }))}
                      sx={{ textTransform: "none", fontSize: "0.75rem" }}
                    >
                      Select All
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setUserForm((f) => ({ ...f, customPermissions: [] }))}
                      sx={{ textTransform: "none", fontSize: "0.75rem", color: "text.secondary" }}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Box>

                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, display: "flex", flexDirection: "column", gap: 1, maxHeight: 260, overflowY: "auto" }}>
                  {AVAILABLE_PERMISSIONS.map((p) => {
                    const isChecked = userForm.customPermissions.includes(p.key);
                    return (
                      <Paper
                        key={p.key}
                        variant="outlined"
                        onClick={() => toggleUserPermissionInWizard(p.key)}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          cursor: "pointer",
                          bgcolor: isChecked ? "#f0f4ff" : "background.paper",
                          borderColor: isChecked ? "#818cf8" : "divider",
                          transition: "all 0.15s ease",
                          "&:hover": { borderColor: "#6366f1" },
                        }}
                      >
                        <Checkbox checked={isChecked} size="small" color="primary" sx={{ p: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {p.icon} {p.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem" }}>
                            {p.description}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Paper>
              </Box>
            </Box>
          )}

          {userSaveError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{userSaveError}</Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
          {userStep === 0 ? (
            <>
              <Button onClick={closeUserDialog} sx={{ textTransform: "none" }}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => setUserStep(1)}
                disabled={!userForm.email || (!editingUser && !userForm.password)}
                endIcon={<ArrowRight size={16} />}
                sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
              >
                Next: Assign Roles & Permissions
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setUserStep(0)}
                startIcon={<ArrowLeft size={16} />}
                sx={{ textTransform: "none" }}
              >
                Back to User Details
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveUser}
                disabled={userSaving || userForm.customPermissions.length === 0}
                endIcon={<Check size={16} />}
                sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
              >
                {userSaving ? "Creating User…" : editingUser ? "Save User Changes" : "Create User"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* --- CREATE / EDIT CUSTOM ROLE DIALOG --- */}
      <Dialog open={roleDialogOpen} onClose={closeRoleDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingRole ? "Edit Custom Role" : "Create New Custom Role"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Role Name"
            value={roleForm.name}
            onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth size="small" required
            placeholder="e.g., Regional Manager"
          />

          <TextField
            label="Description"
            value={roleForm.description}
            onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth size="small" multiline rows={2}
            placeholder="Briefly describe what responsibilities this role handles"
          />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Select Allowed Module Permissions ({roleForm.permissions.length}/{AVAILABLE_PERMISSIONS.length})
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setRoleForm((f) => ({ ...f, permissions: AVAILABLE_PERMISSIONS.map((p) => p.key) }))}
                  sx={{ textTransform: "none", fontSize: "0.75rem" }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => setRoleForm((f) => ({ ...f, permissions: [] }))}
                  sx={{ textTransform: "none", fontSize: "0.75rem", color: "text.secondary" }}
                >
                  Clear All
                </Button>
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
              {AVAILABLE_PERMISSIONS.map((p) => {
                const isChecked = roleForm.permissions.includes(p.key);
                return (
                  <Paper
                    key={p.key}
                    variant="outlined"
                    onClick={() => toggleRolePermission(p.key)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      bgcolor: isChecked ? "#f0f4ff" : "background.paper",
                      borderColor: isChecked ? "#818cf8" : "divider",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "#6366f1" },
                    }}
                  >
                    <Checkbox checked={isChecked} size="small" color="primary" sx={{ p: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.icon} {p.label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {p.description}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Paper>
          </Box>

          {roleSaveError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{roleSaveError}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeRoleDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveRole}
            disabled={roleSaving || !roleForm.name}
            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            {roleSaving ? "Saving…" : editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DELETE USER CONFIRM DIALOG --- */}
      <Dialog open={deleteUserId !== null} onClose={() => setDeleteUserId(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Staff Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this staff account? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteUserId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser} sx={{ textTransform: "none", fontWeight: 600 }}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DELETE ROLE CONFIRM DIALOG --- */}
      <Dialog open={deleteRoleId !== null} onClose={() => setDeleteRoleId(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Custom Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this custom role? Users assigned to this role will fallback to standard permissions.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteRoleId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole} sx={{ textTransform: "none", fontWeight: 600 }}>
            Delete Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
