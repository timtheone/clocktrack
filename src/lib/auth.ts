import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

// Create the auth instance with the correct configuration
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Setup email and password authentication
  emailAndPassword: {
    enabled: true,
  },
});
