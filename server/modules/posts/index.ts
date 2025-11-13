import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { auth } from "@/server/lib/auth";
import { postRoutesMiddleware } from "@/server/middleware";

// Create a shared Prisma instance
const prisma = new PrismaClient();

// Helper to generate MongoDB-compatible ID (24 hex characters)
function generateId(): string {
  return randomBytes(12).toString("hex");
}

const postsRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .use(postRoutesMiddleware)
  // GET /api/posts - Get all posts (with optional query params)
  .get("/", async (c) => {
    const limit = c.req.query("limit");
    const offset = c.req.query("offset");
    
    const posts = await prisma.post.findMany({
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
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
    
    return c.json({
      posts,
      total: posts.length,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  })
  
  // GET /api/posts/:id - Get single post
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    
    const post = await prisma.post.findUnique({
      where: { id },
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
    
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }
    
    return c.json({ post });
  })
  
  // POST /api/posts - Create new post
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(1),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "User not found" }, 401);
      }
      
      const post = await prisma.post.create({
        data: {
          id: generateId(), // Generate ID manually
          title: body.title,
          content: body.content,
          userId: user.id,
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
      
      return c.json({ post, message: "Post created successfully" }, 201);
    }
  );

export default postsRoutes;