# RBAC Implementation Guide

## Overview

A comprehensive Role-Based Access Control (RBAC) system has been implemented for your multi-tenant gym management application. The system follows industry-standard patterns and integrates seamlessly with your existing Better Auth, Hono, Next.js, and Prisma stack.

## Architecture

### Design Patterns Used

1. **Role Hierarchy Pattern**: Three-tier hierarchy (OWNER > TRAINER > USER)
2. **Permission-Based Access Control**: Fine-grained permissions mapped to roles
3. **Middleware Pattern**: Composable middleware for route protection
4. **Context Pattern**: Organization-scoped context for multi-tenancy
5. **Type Safety**: Full TypeScript support with enums and type guards

### File Structure

```
server/lib/rbac/
├── types.ts          # Role and Permission enums, type guards
├── permissions.ts    # Permission checking utilities
├── context.ts        # Organization context helpers
├── middleware.ts     # Hono middleware factories
├── index.ts          # Main exports
└── README.md         # Detailed documentation
```

## Quick Start

### 1. Protect a Route with Organization Context

```typescript
import { requireOrganizationContext, requirePermission, Permission } from "@/server/lib/rbac";

const routes = new Hono()
  .use(requireOrganizationContext) // Must be first!
  .get("/members", requirePermission(Permission.VIEW_MEMBERS), async (c) => {
    const organizationId = c.get("organizationId");
    const role = c.get("role");
    // Your route logic here
  });
```

### 2. Protect with Role

```typescript
import { requireOrganizationContext, requireRole, Role } from "@/server/lib/rbac";

const routes = new Hono()
  .use(requireOrganizationContext)
  .get("/admin", requireRole(Role.OWNER), async (c) => {
    // Only owners can access
  });
```

### 3. Check Permissions in Route Handler

```typescript
import { checkPermission, Permission } from "@/server/lib/rbac";

.get("/custom", async (c) => {
  const role = c.get("role");
  
  if (checkPermission(role, Permission.VIEW_ANALYTICS)) {
    // Show full analytics
  } else {
    // Show limited view
  }
});
```

## Roles and Permissions

### Roles

- **OWNER**: Full access to all features
- **TRAINER**: Can manage workouts, schedules, and assigned users
- **USER**: Basic access to view workouts and schedules

### Key Permissions

- `VIEW_MEMBERS`, `MANAGE_MEMBERS`, `INVITE_MEMBERS`, `REMOVE_MEMBERS`
- `CREATE_WORKOUTS`, `EDIT_WORKOUTS`, `DELETE_WORKOUTS`, `VIEW_WORKOUTS`
- `VIEW_ANALYTICS`, `VIEW_REPORTS`
- `MANAGE_SETTINGS`, `VIEW_SETTINGS`
- `MANAGE_BILLING`, `VIEW_BILLING`

See `server/lib/rbac/types.ts` for the complete list.

## Organization Context

The `requireOrganizationContext` middleware automatically:

1. Authenticates the user via Better Auth
2. Extracts organization ID from:
   - `session.activeOrganizationId` (preferred)
   - Query parameter `?organizationId=...`
   - Route parameter `:organizationId`
3. Validates user membership in the organization
4. Sets context variables:
   - `c.get("user")` - Authenticated user
   - `c.get("session")` - Session object
   - `c.get("organizationId")` - Organization ID
   - `c.get("role")` - User's role in organization
   - `c.get("member")` - Member record

## Example Implementation

See `server/modules/gym/index.ts` for a complete example with:
- Member management (view, invite, remove)
- Workout management (create, view)
- Analytics dashboard
- Settings management
- Owner-only admin routes

## Integration Points

### With Better Auth

- Uses `auth.api.getSession()` for authentication
- Leverages `session.activeOrganizationId` for organization context
- Works with Better Auth's organization plugin

### With Hono

- Middleware integrates with Hono's context system
- Type-safe context variables via TypeScript
- Composable middleware pattern

### With Prisma

- Queries `Member` table for role information
- Organization-scoped queries
- Type-safe database operations

## Best Practices

1. **Always use `requireOrganizationContext` first** for multi-tenant routes
2. **Prefer permissions over roles** for finer-grained control
3. **Validate organization membership** before operations
4. **Use type guards** (`isRole()`, `isPermission()`) for user input
5. **Check role hierarchy** when allowing users to manage others

## Adding New Features

### Add a New Permission

1. Add to `Permission` enum in `types.ts`
2. Add to appropriate role(s) in `ROLE_PERMISSIONS`
3. Use in routes with `requirePermission()`

### Add a New Role

1. Add to `Role` enum in `types.ts`
2. Define permissions in `ROLE_PERMISSIONS`
3. Update hierarchy in `hasRoleHierarchy()` if needed
4. Update `canManageRole()` if it can manage others

## Testing Your RBAC

1. Create test organizations with different roles
2. Test each permission level
3. Verify organization isolation (users can't access other orgs)
4. Test role hierarchy (owners can manage trainers, etc.)

## Next Steps

1. Review the example routes in `server/modules/gym/index.ts`
2. Adapt the patterns to your specific gym management features
3. Add additional permissions as needed
4. Consider adding audit logging for permission checks
5. Add rate limiting for sensitive operations

## Support

For detailed documentation, see `server/lib/rbac/README.md`.

