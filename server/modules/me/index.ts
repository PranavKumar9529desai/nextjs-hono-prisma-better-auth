/**
 * Me Routes
 *
 * Routes that expose information about the currently authenticated member.
 */

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { requireOrganizationContext, Permission, ROLE_PERMISSIONS } from "@/server/lib/rbac";
import type { RBACContext } from "@/server/lib/rbac";

const prisma = new PrismaClient();

type MeContext = {
  Variables: RBACContext;
};

const meRoutes = new Hono<MeContext>()
  .use(requireOrganizationContext)
  .get("/membership", async (c) => {
    const organizationId = c.get("organizationId");
    const role = c.get("role");
    const member = c.get("member");
    const user = c.get("user");

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        createdAt: true,
      },
    });

    const permissions = ROLE_PERMISSIONS[role];
    const can = Object.fromEntries(
      Object.values(Permission).map((permission) => [
        permission,
        permissions.includes(permission),
      ]),
    ) as Record<Permission, boolean>;
    console.log("permissions", permissions, "can", can);
    return c.json({
      user,
      member,
      organization,
      role,
      permissions,
      can,
    });
  });

export default meRoutes;


