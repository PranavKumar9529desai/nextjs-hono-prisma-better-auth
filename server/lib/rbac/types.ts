/**
 * Role-Based Access Control (RBAC) Types and Constants
 * 
 * This file defines the role hierarchy and permission system for the gym management application.
 * Roles are organization-scoped (multi-tenant).
 */

// Role hierarchy: OWNER > TRAINER > USER
export enum Role {
  OWNER = "OWNER",
  TRAINER = "TRAINER",
  USER = "USER",
}

// Permission definitions
export enum Permission {
  // Organization Management
  MANAGE_ORGANIZATION = "MANAGE_ORGANIZATION",
  VIEW_ORGANIZATION = "VIEW_ORGANIZATION",
  DELETE_ORGANIZATION = "DELETE_ORGANIZATION",
  
  // Member Management
  MANAGE_MEMBERS = "MANAGE_MEMBERS",
  INVITE_MEMBERS = "INVITE_MEMBERS",
  REMOVE_MEMBERS = "REMOVE_MEMBERS",
  VIEW_MEMBERS = "VIEW_MEMBERS",
  
  // Trainer Management (Owner only)
  MANAGE_TRAINERS = "MANAGE_TRAINERS",
  ASSIGN_TRAINERS = "ASSIGN_TRAINERS",
  
  // User Management
  MANAGE_USERS = "MANAGE_USERS",
  VIEW_USERS = "VIEW_USERS",
  
  // Workout Management
  CREATE_WORKOUTS = "CREATE_WORKOUTS",
  EDIT_WORKOUTS = "EDIT_WORKOUTS",
  DELETE_WORKOUTS = "DELETE_WORKOUTS",
  VIEW_WORKOUTS = "VIEW_WORKOUTS",
  ASSIGN_WORKOUTS = "ASSIGN_WORKOUTS",
  
  // Schedule Management
  MANAGE_SCHEDULE = "MANAGE_SCHEDULE",
  VIEW_SCHEDULE = "VIEW_SCHEDULE",
  
  // Analytics & Reports
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  VIEW_REPORTS = "VIEW_REPORTS",
  
  // Billing & Payments
  MANAGE_BILLING = "MANAGE_BILLING",
  VIEW_BILLING = "VIEW_BILLING",
  
  // Settings
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
  VIEW_SETTINGS = "VIEW_SETTINGS",
}

// Role to Permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    // Full access to everything
    Permission.MANAGE_ORGANIZATION,
    Permission.VIEW_ORGANIZATION,
    Permission.DELETE_ORGANIZATION,
    Permission.MANAGE_MEMBERS,
    Permission.INVITE_MEMBERS,
    Permission.REMOVE_MEMBERS,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_TRAINERS,
    Permission.ASSIGN_TRAINERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CREATE_WORKOUTS,
    Permission.EDIT_WORKOUTS,
    Permission.DELETE_WORKOUTS,
    Permission.VIEW_WORKOUTS,
    Permission.ASSIGN_WORKOUTS,
    Permission.MANAGE_SCHEDULE,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_SETTINGS,
  ],
  [Role.TRAINER]: [
    // Can manage workouts, schedules, and assigned users
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_USERS,
    Permission.CREATE_WORKOUTS,
    Permission.EDIT_WORKOUTS,
    Permission.DELETE_WORKOUTS,
    Permission.VIEW_WORKOUTS,
    Permission.ASSIGN_WORKOUTS,
    Permission.MANAGE_SCHEDULE,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_SETTINGS,
  ],
  [Role.USER]: [
    // Basic user permissions
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_WORKOUTS,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_SETTINGS,
  ],
};

// Type guard to check if a string is a valid role
export function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

// Type guard to check if a string is a valid permission
export function isPermission(value: string): value is Permission {
  return Object.values(Permission).includes(value as Permission);
}

// Role hierarchy check - returns true if role1 has higher or equal privileges than role2
export function hasRoleHierarchy(role1: Role, role2: Role): boolean {
  const hierarchy: Record<Role, number> = {
    [Role.OWNER]: 3,
    [Role.TRAINER]: 2,
    [Role.USER]: 1,
  };
  return hierarchy[role1] >= hierarchy[role2];
}

