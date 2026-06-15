import DiscordProvider from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — no DB or Prisma imports.
 * Used by middleware (runs on Edge runtime).
 * The full config (with PrismaAdapter) lives in config.ts.
 */
export const edgeAuthConfig = {
  providers: [DiscordProvider],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
