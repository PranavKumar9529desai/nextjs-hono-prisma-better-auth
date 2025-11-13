import client from "@/lib/trpc";
import type { Permission, Role } from "@/server/lib/rbac";

export interface MembershipSummary {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  member: {
    userId: string;
    organizationId: string;
    role: Role;
  };
  organization: {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
    createdAt: string;
  } | null;
  role: Role;
  permissions: Permission[];
  can: Record<Permission, boolean>;
}

export async function fetchMembership(): Promise<MembershipSummary> {
  const response = await client.api.me.membership.$get();

  if (!response.ok) {
    let message = "Failed to fetch membership";

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      // ignore JSON parsing errors
    }

    throw new Error(message);
  }

  return (await response.json()) as MembershipSummary;
}

export function hasRole(
  role: Role | Role[],
  membership?: MembershipSummary | null,
): boolean {
  if (!membership) {
    return false;
  }

  const targetRoles = Array.isArray(role) ? role : [role];
  return targetRoles.includes(membership.role);
}

export interface PermissionCheckOptions {
  requireAll?: boolean;
}

export function hasPermission(
  permissions: Permission | Permission[],
  membership?: MembershipSummary | null,
  options: PermissionCheckOptions = {},
): boolean {
  if (!membership) {
    return false;
  }

  const targetPermissions = Array.isArray(permissions) ? permissions : [permissions];
  const { requireAll = false } = options;

  if (requireAll) {
    return targetPermissions.every((permission) => membership.can[permission]);
  }

  return targetPermissions.some((permission) => membership.can[permission]);
}

export function listPermissions(membership?: MembershipSummary | null): Permission[] {
  return membership?.permissions ?? [];
}



