'use client';

import type { ReactNode } from "react";
import type { Permission, Role } from "@/server/lib/rbac";
import { useRBAC } from "@/hooks/use-rbac";

interface GuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

interface RequireRoleProps extends GuardProps {
  role: Role | Role[];
}

interface RequirePermissionProps extends GuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
}

export function RequireRole({ role, children, fallback = null, loading = null }: RequireRoleProps) {
  const { hasRole, isLoading } = useRBAC();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RequirePermission({
  permission,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}: RequirePermissionProps) {
  const { can, isLoading } = useRBAC();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!can(permission, { requireAll })) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}


