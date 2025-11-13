/**
 * Permission checking utilities
 * 
 * These functions help check if a user has specific permissions based on their role.
 */

import { Role, type Permission, ROLE_PERMISSIONS, hasRoleHierarchy } from "./types";

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if role1 can manage role2 (based on hierarchy)
 */
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  // Owners can manage everyone
  if (managerRole === Role.OWNER) {
    return true;
  }
  
  // Trainers can manage users only
  if (managerRole === Role.TRAINER && targetRole === Role.USER) {
    return true;
  }
  
  // Users cannot manage anyone
  return false;
}

/**
 * Check if a role can perform an action on another role
 */
export function canPerformAction(
  actorRole: Role,
  targetRole: Role,
  action: "view" | "edit" | "delete" | "manage"
): boolean {
  // Cannot perform actions on same or higher role
  if (!hasRoleHierarchy(actorRole, targetRole)) {
    return false;
  }
  
  // Owners can do everything
  if (actorRole === Role.OWNER) {
    return true;
  }
  
  // Trainers can view and edit users
  if (actorRole === Role.TRAINER && targetRole === Role.USER) {
    return action === "view" || action === "edit";
  }
  
  return false;
}

