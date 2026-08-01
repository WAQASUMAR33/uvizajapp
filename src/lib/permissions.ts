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
  | "roles";

export interface UserAuthDetails {
  id?: string | number;
  role?: string | null;
  permissions?: string[] | null;
  rolePermissions?: string[] | null;
}

/**
 * Returns an array of unique permissions granted to the user.
 * SUPER_ADMIN and ADMIN get all system permissions.
 * Other roles inherit their custom user permissions (overrides) or role default permissions.
 */
export function getUserPermissions(user?: any): string[] {
  if (!user || !user.role) return [];

  const role = String(user.role).toUpperCase();

  // Full access for ADMIN and SUPER_ADMIN
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return [
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
    ];
  }

  // If user has specific permission overrides set (array), prioritize them
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }

  // Fallback to role-level default permissions
  if (Array.isArray(user.rolePermissions) && user.rolePermissions.length > 0) {
    return user.rolePermissions;
  }

  return [];
}

/**
 * Checks whether a user has permission to access a specific feature or route.
 */
export function hasPermission(user?: any, permission?: PermissionKey | string): boolean {
  if (!user || !user.role || !permission) return false;

  const role = String(user.role).toUpperCase();

  // ADMIN and SUPER_ADMIN always have permission
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return true;
  }

  const effectivePermissions = getUserPermissions(user);
  return effectivePermissions.includes(permission);
}
