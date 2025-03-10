import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import api from "./routes/api";

const app = new Hono();

// Add middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Mount the auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Mount API routes and Swagger UI
app.route("/api", api);

// Simple ping route for health checks
app.get("/ping", (c) => c.text("pong"));

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
