import { Hono } from "hono";
import authController from "./modules/auth";
import privateRoutes from "./modules/private";
import postsRoutes from "./modules/posts";
import gymRoutes from "./modules/gym";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", authController)
  .route("/private", privateRoutes)
  .route("/posts", postsRoutes)
  .route("/gym", gymRoutes);

export type AppType = typeof routes;
export default app;
