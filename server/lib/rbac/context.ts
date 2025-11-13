/**
 * RBAC Context utilities
 * 
 * Functions to get and validate user roles within an organization context.
 */

import { PrismaClient } from "@prisma/client";
import { type Role, isRole } from "./types";

const prisma = new PrismaClient();

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: Role;
}

/**
 * Get user's role in a specific organization
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<Role | null> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
    select: {
      role: true,
    },
  });

  if (!member || !isRole(member.role)) {
    return null;
  }

  return member.role as Role;
}

/**
 * Get user's membership info in a specific organization
 */
export async function getOrganizationMember(
  userId: string,
  organizationId: string
): Promise<OrganizationMember | null> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (!member || !isRole(member.role)) {
    return null;
  }

  return {
    userId: member.userId,
    organizationId: member.organizationId,
    role: member.role as Role,
  };
}

/**
 * Check if user is a member of an organization
 */
export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  return !!member;
}

/**
 * Get all organizations a user belongs to with their roles
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationMember[]> {
  const members = await prisma.member.findMany({
    where: {
      userId,
    },
  });

  return members
    .filter((m) => isRole(m.role))
    .map((m) => ({
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role as Role,
    }));
}

