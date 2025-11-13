# Role-Based Access Control (RBAC) System

This RBAC system provides a comprehensive, industry-standard approach to managing permissions in a multi-tenant gym management application.

## Architecture Overview

The RBAC system is built with the following design principles:

1. **Role Hierarchy**: OWNER > TRAINER > USER
2. **Permission-Based**: Actions are controlled by permissions, not just roles
3. **Multi-Tenant**: All permissions are scoped to organizations
4. **Type-Safe**: Full TypeScript support with enums and type guards
5. **Middleware-Based**: Easy-to-use middleware for route protection

## File Structure

```
server/lib/rbac/
├── types.ts          # Role and Permission definitions
├── permissions.ts    # Permission checking utilities
├── context.ts        # Organization context utilities
├── middleware.ts     # Hono middleware for RBAC
└── index.ts          # Main exports
```

## Roles

### OWNER
- Full access to all features
- Can manage organization settings
- Can invite/remove members of any role
- Can manage trainers
- Access to analytics and reports

### TRAINER
- Can create, edit, and assign workouts
- Can manage schedules
- Can view assigned users
- Can view analytics
- Cannot manage organization settings
- Cannot invite/remove owners

### USER
- Can view their own workouts
- Can view schedules
- Can view basic organization info
- Limited access to settings

## Permissions

Permissions are granular actions that can be performed. Each role has a set of permissions. See `types.ts` for the complete list.

Common permissions:
- `VIEW_MEMBERS` - View organization members
- `MANAGE_MEMBERS` - Full member management
- `CREATE_WORKOUTS` - Create workout plans
- `VIEW_ANALYTICS` - Access analytics dashboard
- `MANAGE_SETTINGS` - Modify organization settings

## Usage Examples

### Basic Route Protection

```typescript
import { requireOrganizationContext, requirePermission, Permission } from "@/server/lib/rbac";

const routes = new Hono()
  .use(requireOrganizationContext) // Must be first - sets organization context
  .get("/members", requirePermission(Permission.VIEW_MEMBERS), async (c) => {
    const organizationId = c.get("organizationId");
    const role = c.get("role");
    // ... your route logic
  });
```

### Role-Based Protection

```typescript
import { requireOrganizationContext, requireRole, Role } from "@/server/lib/rbac";

const routes = new Hono()
  .use(requireOrganizationContext)
  .get("/admin", requireRole(Role.OWNER), async (c) => {
    // Only owners can access
  });
```

### Multiple Permissions

```typescript
// Require ANY of the permissions
.get("/data", requirePermission(Permission.VIEW_ANALYTICS, Permission.VIEW_REPORTS), ...)

// Require ALL permissions (use requireAllPermissions)
.get("/sensitive", requireAllPermissions(Permission.VIEW_ANALYTICS, Permission.MANAGE_SETTINGS), ...)
```

### Checking Permissions in Route Handlers

```typescript
import { checkPermission, Permission } from "@/server/lib/rbac";

.get("/custom", async (c) => {
  const role = c.get("role");
  
  if (checkPermission(role, Permission.VIEW_ANALYTICS)) {
    // Show analytics
  } else {
    // Show limited view
  }
});
```

### Organization Context

The `requireOrganizationContext` middleware:
1. Authenticates the user
2. Extracts organization ID from:
   - `session.activeOrganizationId` (preferred)
   - Query parameter `organizationId`
   - Route parameter `organizationId`
3. Validates user membership in the organization
4. Sets context variables:
   - `user` - The authenticated user
   - `session` - The session object
   - `organizationId` - The organization ID
   - `role` - User's role in the organization
   - `member` - The member record

## Best Practices

1. **Always use `requireOrganizationContext` first** for multi-tenant routes
2. **Use permissions over roles** when possible for finer-grained control
3. **Check role hierarchy** when allowing users to manage other users
4. **Validate organization membership** before performing operations
5. **Use type guards** (`isRole()`, `isPermission()`) when working with user input

## Adding New Permissions

1. Add the permission to the `Permission` enum in `types.ts`
2. Add it to the appropriate role(s) in `ROLE_PERMISSIONS`
3. Use it in your routes with `requirePermission()`

## Adding New Roles

1. Add the role to the `Role` enum in `types.ts`
2. Define permissions for the role in `ROLE_PERMISSIONS`
3. Update the role hierarchy in `hasRoleHierarchy()` if needed
4. Update `canManageRole()` if the new role can manage others

## Integration with Better Auth

The RBAC system integrates seamlessly with Better Auth:
- Uses Better Auth sessions for authentication
- Leverages the organization plugin for multi-tenancy
- Works with `activeOrganizationId` from sessions

## Example: Complete Route Module

See `server/modules/gym/index.ts` for a complete example of RBAC-protected routes.

