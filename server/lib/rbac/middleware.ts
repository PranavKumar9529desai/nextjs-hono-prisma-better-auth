/**
 * RBAC Middleware for Hono
 * 
 * Middleware functions to protect routes based on roles and permissions.
 */

import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { Role, Permission } from "./types";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./permissions";
import { getUserRoleInOrganization, getOrganizationMember } from "./context";

export interface RBACContext {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
  organizationId: string;
  role: Role;
  member: Awaited<ReturnType<typeof getOrganizationMember>>;
}

/**
 * Base middleware that ensures user is authenticated and has organization context
 */
export const requireOrganizationContext = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  // Get organization ID from session or query/params
  const organizationId =
    session.session.activeOrganizationId ||
    c.req.query("organizationId") ||
    c.req.param("organizationId");

  if (!organizationId) {
    c.status(400);
    return c.json({ message: "Organization ID is required" });
  }

  // Get user's role in the organization
  const member = await getOrganizationMember(session.user.id, organizationId);

  if (!member) {
    c.status(403);
    return c.json({ message: "User is not a member of this organization" });
  }

  // Set context variables
  c.set("user", session.user);
  c.set("session", session.session);
  c.set("organizationId", organizationId);
  c.set("role", member.role);
  c.set("member", member);

  return next();
});

/**
 * Middleware factory to require specific role(s)
 */
export function requireRole(...allowedRoles: Role[]) {
  return createMiddleware<{
    Variables: {
      user: typeof auth.$Infer.Session.user;
      session: typeof auth.$Infer.Session.session;
      organizationId: string;
      role: Role;
      member: Awaited<ReturnType<typeof getOrganizationMember>>;
    };
  }>(async (c, next) => {
    const role = c.get("role");

    if (!role || !allowedRoles.includes(role)) {
      c.status(403);
      return c.json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    return next();
  });
}

/**
 * Middleware factory to require specific permission(s)
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return createMiddleware<{
    Variables: {
      user: typeof auth.$Infer.Session.user;
      session: typeof auth.$Infer.Session.session;
      organizationId: string;
      role: Role;
      member: Awaited<ReturnType<typeof getOrganizationMember>>;
    };
  }>(async (c, next) => {
    const role = c.get("role");

    if (!role) {
      c.status(403);
      return c.json({ message: "Role not found in context" });
    }

    // Check if user has any of the required permissions
    if (!hasAnyPermission(role, requiredPermissions)) {
      c.status(403);
      return c.json({
        message: `Access denied. Required permission: ${requiredPermissions.join(" or ")}`,
      });
    }

    return next();
  });
}

/**
 * Middleware factory to require all specified permissions
 */
export function requireAllPermissions(...requiredPermissions: Permission[]) {
  return createMiddleware<{
    Variables: {
      user: typeof auth.$Infer.Session.user;
      session: typeof auth.$Infer.Session.session;
      organizationId: string;
      role: Role;
      member: Awaited<ReturnType<typeof getOrganizationMember>>;
    };
  }>(async (c, next) => {
    const role = c.get("role");

    if (!role) {
      c.status(403);
      return c.json({ message: "Role not found in context" });
    }

    // Check if user has all of the required permissions
    if (!hasAllPermissions(role, requiredPermissions)) {
      c.status(403);
      return c.json({
        message: `Access denied. Required all permissions: ${requiredPermissions.join(" and ")}`,
      });
    }

    return next();
  });
}

/**
 * Helper function to check permission in route handlers
 */
export function checkPermission(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

