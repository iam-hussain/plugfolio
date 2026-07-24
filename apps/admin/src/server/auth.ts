import { credentialsInput, verifyAdminCredentials } from "@plugfolio/core";
import NextAuth, { type DefaultSession, type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { repositories } from "./container";

/**
 * Admin sign-in (ADR-0014): credentials against the AdminUser table — never
 * the product User table, so a product-auth bug can't escalate to admin.
 * Sessions are stateless JWTs: nothing else validates them (unlike the web
 * app, whose DB sessions exist for apps/api), and the cookie name is
 * app-specific so dev on localhost never clobbers a web session.
 */

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const SESSION_MAX_AGE_S = 12 * 60 * 60; // one working day, not a month

const nextAuth = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_S },
  pages: { signIn: "/signin" },
  cookies: {
    sessionToken: {
      name: "admin.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsInput.safeParse(raw);
        if (!parsed.success) return null;
        const result = await verifyAdminCredentials(
          { admins: repositories.admins, now: () => new Date() },
          parsed.data,
        );
        if (!result.ok) return null; // one generic failure — no admin oracle
        return { id: result.adminId, email: result.email, name: result.name };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      return {
        expires: session.expires,
        user: {
          id: token.sub ?? "",
          email: token.email ?? "",
          name: token.name ?? null,
          image: null,
        },
      };
    },
  },
});

// Explicit annotations — next-auth's inferred types aren't portable under pnpm
// (TS2742).
export const handlers = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

/** Layout/action guard: the signed-in admin, or a redirect to /signin. */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  return { id: session.user.id, email: session.user.email ?? "" };
}
