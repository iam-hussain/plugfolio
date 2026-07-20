import { createAuthAdapter } from "@plugfolio/db";
import NextAuth, { type DefaultSession, type NextAuthResult } from "next-auth";
import { env } from "@/env";

/**
 * Auth.js (ADR-0007): email magic-link sign-in for every account holder —
 * creators, shoppers, businesses (ADR-0004: the username is never a login).
 * Database sessions via the Prisma adapter. Nothing here touches any shop
 * path: anonymous shopping stays account-free (ADR-0002, §2.2).
 */

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const nextAuth = NextAuth({
  adapter: createAuthAdapter(),
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "database" },
  providers: [
    {
      id: "email",
      type: "email",
      name: "Email",
      from: env.EMAIL_FROM,
      maxAge: 24 * 60 * 60,
      options: {},
      async sendVerificationRequest({ identifier, url }) {
        // ponytail: no mail transport yet — log the magic link; a real provider
        // (SMTP/Resend) plugs in here when deployment lands. Dev signs in by
        // copying the link from the server console.
        console.log(`[auth] magic link for ${identifier}: ${url}`);
      },
    },
  ],
  callbacks: {
    // Expose the user id so server components can scope reads (getMyProfiles).
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});

// Explicit annotations — next-auth's inferred types aren't portable under pnpm
// (TS2742).
export const handlers = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
