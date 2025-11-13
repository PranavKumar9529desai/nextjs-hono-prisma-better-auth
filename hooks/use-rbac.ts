'use client';

import { useCallback } from "react";
import useSWR, { type SWRConfiguration } from "swr";

import {
  fetchMembership,
  hasPermission as membershipHasPermission,
  hasRole as membershipHasRole,
  type MembershipSummary,
  type PermissionCheckOptions,
} from "@/lib/rbac-client";
import type { Permission, Role } from "@/server/lib/rbac";

export type MembershipSWRConfig = SWRConfiguration<MembershipSummary, Error>;

export function useMembership(options?: MembershipSWRConfig) {
  return useSWR<MembershipSummary, Error>("membership", () => fetchMembership(), {
    revalidateOnFocus: false,
    ...options,
  });
}

interface UseRBACOptions extends MembershipSWRConfig {
  permissionOptions?: PermissionCheckOptions;
}

export function useRBAC(options?: UseRBACOptions) {
  const { permissionOptions, ...swrOptions } = options ?? {};
  const swr = useMembership(swrOptions);

  const can = useCallback(
    (permissions: Permission | Permission[], override?: PermissionCheckOptions) =>
      membershipHasPermission(permissions, swr.data, override ?? permissionOptions),
    [permissionOptions, swr.data],
  );

  const hasRole = useCallback(
    (roles: Role | Role[]) => membershipHasRole(roles, swr.data),
    [swr.data],
  );

  return {
    ...swr,
    role: swr.data?.role ?? null,
    permissions: swr.data?.permissions ?? [],
    can,
    hasRole,
  };
}

export function usePermission(
  permissions: Permission | Permission[],
  options?: UseRBACOptions,
) {
  const { can, ...rest } = useRBAC(options);
  return {
    ...rest,
    can: can(permissions),
  };
}


