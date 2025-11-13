/**
 * Gym Management Routes
 * 
 * Example implementation of RBAC-protected routes for gym management.
 * This demonstrates how to use the RBAC system in practice.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { auth } from "@/server/lib/auth";
import {
  requireOrganizationContext,
  requireRole,
  requirePermission,
  Role,
  Permission,
} from "@/server/lib/rbac";

// Helper to generate MongoDB-compatible ID (24 hex characters)
function generateId(): string {
  return randomBytes(12).toString("hex");
}

const prisma = new PrismaClient();

// Type definitions for Hono context
type GymContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
    organizationId: string;
    role: Role;
    member: Awaited<ReturnType<typeof import("@/server/lib/rbac/context").getOrganizationMember>>;
  };
};

const gymRoutes = new Hono<GymContext>()
  // All routes require organization context
  .use(requireOrganizationContext)

  // GET /api/gym/members - View all members (requires VIEW_MEMBERS permission)
  .get(
    "/members",
    requirePermission(Permission.VIEW_MEMBERS),
    async (c) => {
      const organizationId = c.get("organizationId");
      const role = c.get("role");

      const members = await prisma.member.findMany({
        where: {
          organizationId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return c.json({
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          user: m.user,
          createdAt: m.createdAt,
        })),
      });
    }
  )

  // POST /api/gym/members/invite - Invite new member (requires INVITE_MEMBERS permission)
  .post(
    "/members/invite",
    requirePermission(Permission.INVITE_MEMBERS),
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        role: z.enum([Role.USER, Role.TRAINER, Role.OWNER]),
      })
    ),
    async (c) => {
      const organizationId = c.get("organizationId");
      const inviterId = c.get("user").id;
      const inviterRole = c.get("role");
      const body = c.req.valid("json");

      // Check if inviter can assign this role
      if (body.role === Role.OWNER && inviterRole !== Role.OWNER) {
        return c.json({ error: "Only owners can invite other owners" }, 403);
      }

      if (body.role === Role.TRAINER && inviterRole === Role.USER) {
        return c.json({ error: "Users cannot invite trainers" }, 403);
      }

      // Create invitation
      const invitation = await prisma.invitation.create({
        data: {
          id: generateId(),
          organizationId,
          email: body.email,
          role: body.role,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          inviterId,
        },
      });

      return c.json({ invitation, message: "Invitation sent" }, 201);
    }
  )

  // DELETE /api/gym/members/:userId - Remove member (requires REMOVE_MEMBERS permission)
  .delete(
    "/members/:userId",
    requirePermission(Permission.REMOVE_MEMBERS),
    async (c) => {
      const organizationId = c.get("organizationId");
      const removerRole = c.get("role");
      const targetUserId = c.req.param("userId");

      // Get target member's role
      const targetMember = await prisma.member.findFirst({
        where: {
          userId: targetUserId,
          organizationId,
        },
      });

      if (!targetMember) {
        return c.json({ error: "Member not found" }, 404);
      }

      // Check if remover can remove this member (based on role hierarchy)
      if (targetMember.role === Role.OWNER && removerRole !== Role.OWNER) {
        return c.json({ error: "Cannot remove owner" }, 403);
      }

      if (targetMember.role === Role.TRAINER && removerRole === Role.USER) {
        return c.json({ error: "Users cannot remove trainers" }, 403);
      }

      await prisma.member.delete({
        where: {
          id: targetMember.id,
        },
      });

      return c.json({ message: "Member removed successfully" });
    }
  )

  // GET /api/gym/workouts - View workouts (requires VIEW_WORKOUTS permission)
  .get(
    "/workouts",
    requirePermission(Permission.VIEW_WORKOUTS),
    async (c) => {
      const organizationId = c.get("organizationId");
      const role = c.get("role");
      const userId = c.get("user").id;

      // Users can only see their own workouts, trainers and owners see all
      const whereClause =
        role === Role.USER
          ? {
              organizationId,
              userId, // Users see only their workouts
            }
          : {
              organizationId, // Trainers and owners see all
            };

      const workouts = await prisma.post.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json({ workouts });
    }
  )

  // POST /api/gym/workouts - Create workout (requires CREATE_WORKOUTS permission)
  .post(
    "/workouts",
    requirePermission(Permission.CREATE_WORKOUTS),
    zValidator(
      "json",
      z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1),
      })
    ),
    async (c) => {
      const organizationId = c.get("organizationId");
      const userId = c.get("user").id;
      const body = c.req.valid("json");

      const workout = await prisma.post.create({
        data: {
          id: generateId(),
          title: body.title,
          content: body.content,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return c.json({ workout, message: "Workout created successfully" }, 201);
    }
  )

  // GET /api/gym/analytics - View analytics (requires VIEW_ANALYTICS permission)
  .get(
    "/analytics",
    requirePermission(Permission.VIEW_ANALYTICS),
    async (c) => {
      const organizationId = c.get("organizationId");

      // Get member count
      const memberCount = await prisma.member.count({
        where: { organizationId },
      });

      // Get role distribution
      const roleDistribution = await prisma.member.groupBy({
        by: ["role"],
        where: { organizationId },
        _count: true,
      });

      return c.json({
        analytics: {
          memberCount,
          roleDistribution: roleDistribution.map((r) => ({
            role: r.role,
            count: r._count,
          })),
        },
      });
    }
  )

  // GET /api/gym/settings - View settings (requires VIEW_SETTINGS permission)
  .get(
    "/settings",
    requirePermission(Permission.VIEW_SETTINGS),
    async (c) => {
      const organizationId = c.get("organizationId");

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

      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      return c.json({ organization });
    }
  )

  // PUT /api/gym/settings - Update settings (requires MANAGE_SETTINGS permission)
  .put(
    "/settings",
    requirePermission(Permission.MANAGE_SETTINGS),
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        logo: z.string().url().optional(),
      })
    ),
    async (c) => {
      const organizationId = c.get("organizationId");
      const body = c.req.valid("json");

      const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: body,
      });

      return c.json({ organization, message: "Settings updated successfully" });
    }
  )

  // Owner-only route example
  .get(
    "/admin/stats",
    requireRole(Role.OWNER),
    async (c) => {
      const organizationId = c.get("organizationId");

      // Only owners can access this
      const stats = {
        totalMembers: await prisma.member.count({
          where: { organizationId },
        }),
        totalWorkouts: await prisma.post.count({
          where: { organizationId },
        }),
        // Add more stats as needed
      };

      return c.json({ stats });
    }
  );

export default gymRoutes;

