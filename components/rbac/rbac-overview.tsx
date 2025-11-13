'use client';

import { Role, Permission } from "@/server/lib/rbac";
import { useRBAC } from "@/hooks/use-rbac";
import { RequirePermission, RequireRole } from "./guards";

export default function RBACOverview() {
  const { data, error, isLoading, role, permissions, can } = useRBAC();

  if (isLoading) {
    return (
      <section className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
        Loading member context...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
        Failed to load membership: {error.message}
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 text-sm">
      <header className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">RBAC context</p>
        <h2 className="text-base font-semibold text-neutral-100">
          Role: <span className="font-mono">{role}</span>
        </h2>
        <p className="text-neutral-400">
          Organization ID: <span className="font-mono text-neutral-300">{data.member.organizationId}</span>
        </p>
      </header>

      <div>
        <p className="font-medium text-neutral-200">Permissions</p>
        <ul className="mt-2 grid grid-cols-1 gap-1 text-neutral-400 sm:grid-cols-2">
          {permissions.map((permission) => (
            <li key={permission} className="rounded bg-neutral-900 px-2 py-1 font-mono text-xs">
              {permission}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <RequireRole
          role={Role.OWNER}
          fallback={
            <p className="rounded border border-neutral-800 bg-neutral-900/70 p-3 text-neutral-400">
              Only owners see owner controls.
            </p>
          }
        >
          <p className="rounded border border-emerald-700/40 bg-emerald-500/10 p-3 text-emerald-200">
            You are an owner. Show admin-only controls here.
          </p>
        </RequireRole>

        <RequirePermission
          permission={[Permission.CREATE_WORKOUTS, Permission.ASSIGN_WORKOUTS]}
          requireAll
          fallback={
            <p className="rounded border border-neutral-800 bg-neutral-900/70 p-3 text-neutral-400">
              Trainer or owner permissions required to create and assign workouts.
            </p>
          }
        >
          <p className="rounded border border-sky-700/40 bg-sky-500/10 p-3 text-sky-200">
            You can create and assign workouts.
          </p>
        </RequirePermission>
      </div>

      <footer className="rounded border border-neutral-800 bg-neutral-900/70 p-3 text-neutral-400">
        <p>
          `can(Permission.MANAGE_MEMBERS)` →{" "}
          <span className="font-mono text-neutral-200">
            {can(Permission.MANAGE_MEMBERS) ? "true" : "false"}
          </span>
        </p>
      </footer>
    </section>
  );
}


