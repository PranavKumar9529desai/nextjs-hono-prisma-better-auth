import { createMiddleware } from "hono/factory";
import { auth } from "./lib/auth";
import { requireOrganizationContext } from "./lib/rbac";

/**
 * Basic authentication middleware (no organization context required)
 * Use this for routes that don't need organization-scoped access
 */
const privateRoutesMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export default privateRoutesMiddleware;

/**
 * Post routes middleware (legacy - consider migrating to RBAC)
 * @deprecated Use requireOrganizationContext from RBAC module instead
 */
export const postRoutesMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

/**
 * Export RBAC middleware for convenience
 */
export { requireOrganizationContext };