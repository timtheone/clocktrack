import { Context, Next } from "hono";
import { auth } from "../lib/auth";

// Authentication middleware
export const authenticate = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Authentication required" }, 401);
    }

    // Attach user and session to context for later use
    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  } catch (error) {
    return c.json({ error: "Authentication failed" }, 401);
  }
};
