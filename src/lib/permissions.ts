export type PermissionKey =
  | "dashboard"
  | "merchants"
  | "categories"
  | "offers"
  | "customers"
  | "redemptions"
  | "subscriptions"
  | "subscription_packages"
  | "terms"
  | "users"
  | "roles"
  | "support";

export interface UserAuthDetails {
  id?: string | number;
  role?: string | null;
  permissions?: string[] | null;
  rolePermissions?: string[] | null;
}

const ALL_SYSTEM_PERMISSIONS: PermissionKey[] = [
  "dashboard",
  "merchants",
  "categories",
  "offers",
  "customers",
  "redemptions",
  "subscriptions",
  "subscription_packages",
  "terms",
  "users",
  "roles",
  "support",
];

const ADMIN_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "dashboard",
  "merchants",
  "categories",
  "offers",
  "customers",
  "redemptions",
  "subscriptions",
  "subscription_packages",
  "terms",
  "users",
  "support",
];

const ACCOUNTANT_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "dashboard",
  "customers",
  "redemptions",
  "subscriptions",
  "subscription_packages",
  "support",
];

const SALESMAN_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "dashboard",
  "merchants",
];

/**
 * Returns an array of unique permissions granted to the user.
 * 
 * 1. Priority 1 (User-Specific Overrides): If Array.isArray(user.permissions), return user.permissions.
 *    This applies to ALL roles (Admin, Salesman, Accountant, and Custom Roles).
 * 2. Priority 2 (Custom Role Permissions): If Array.isArray(user.rolePermissions) and non-empty, return user.rolePermissions.
 * 3. Priority 3 (System Role Defaults): Default system role fallback definitions.
 */
export function getUserPermissions(user?: any): string[] {
  if (!user || !user.role) return [];

  // Priority 1: User-level explicit permissions (overrides for ANY role)
  if (Array.isArray(user.permissions)) {
    return user.permissions;
  }

  // Priority 2: Custom Role assigned permissions (from Role table)
  if (Array.isArray(user.rolePermissions) && user.rolePermissions.length > 0) {
    return user.rolePermissions;
  }

  // Priority 3: System Role Defaults
  const role = String(user.role).toUpperCase();

  if (role === "SUPER_ADMIN") {
    return ALL_SYSTEM_PERMISSIONS;
  }

  if (role === "ADMIN") {
    return ADMIN_DEFAULT_PERMISSIONS;
  }

  if (role === "ACCOUNTANT") {
    return ACCOUNTANT_DEFAULT_PERMISSIONS;
  }

  if (role === "SALESMAN") {
    return SALESMAN_DEFAULT_PERMISSIONS;
  }

  return [];
}

/**
 * Checks whether a user has permission to access a specific feature or route.
 */
export function hasPermission(user?: any, permission?: PermissionKey | string): boolean {
  if (!user || !user.role || !permission) return false;

  const role = String(user.role).toUpperCase();

  // If SUPER_ADMIN has no explicit overrides, full access by default
  if (role === "SUPER_ADMIN" && !Array.isArray(user.permissions)) {
    return true;
  }

  const effectivePermissions = getUserPermissions(user);
  return effectivePermissions.includes(permission);
}
