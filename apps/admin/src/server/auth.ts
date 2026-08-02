import { adminCredentialsInput, createFailureLimit, verifyAdminCredentials } from "@plugfolio/core";
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
    /** The AdminUser.sessionVersion this JWT was minted against. */
    sessionVersion: number;
  }
}

const SESSION_MAX_AGE_S = 12 * 60 * 60; // one working day, not a month

/** 5 failures / 15 min per email, then the same silent generic no. */
const loginLimit = createFailureLimit({ windowMs: 15 * 60 * 1000, maxFailures: 5 });

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
        const parsed = adminCredentialsInput.safeParse(raw);
        if (!parsed.success) return null;
        // Rate limit BEFORE touching credentials; limited = same generic no.
        if (loginLimit.isLimited(parsed.data.email)) return null;
        const result = await verifyAdminCredentials(
          { admins: repositories.admins, now: () => new Date() },
          parsed.data,
        );
        if (!result.ok) {
          loginLimit.recordFailure(parsed.data.email);
          return null; // one generic failure — no admin oracle
        }
        loginLimit.clear(parsed.data.email);
        return {
          id: result.adminId,
          email: result.email,
          name: result.name,
          sessionVersion: result.sessionVersion,
        } as { id: string; email: string; name: string | null };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && "sessionVersion" in user) {
        token.sv = (user as { sessionVersion: number }).sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      return {
        expires: session.expires,
        sessionVersion: typeof token.sv === "number" ? token.sv : -1,
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

/**
 * A JWT alone is not enough (revocation): the admin row must still exist and
 * the token's sessionVersion must match — a removed operator or a password
 * change kills outstanding sessions on their next request.
 */
export async function validAdminSession(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  if (!session?.user.id) return null;
  const admin = await repositories.admins.findById(session.user.id);
  if (!admin || admin.sessionVersion !== session.sessionVersion) return null;
  return { id: admin.id, email: admin.email };
}

/** Layout/action guard: the signed-in admin, or a redirect to /signin. */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const admin = await validAdminSession();
  if (!admin) redirect("/signin");
  return admin;
}
