import { randomUUID } from "node:crypto";
import { credentialsInput, verifyCredentials } from "@plugfolio/core";
import { createAuthAccountRepository, createAuthAdapter } from "@plugfolio/db";
import NextAuth, { CredentialsSignin, type DefaultSession, type NextAuthResult } from "next-auth";
import { encode as defaultJwtEncode } from "next-auth/jwt";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { env } from "@/env";

/**
 * Auth.js (ADR-0012, amends ADR-0007): email + password sign-in for every
 * account holder; the email link exists only for verification/reset (served by
 * apps/api). Sessions STAY database sessions — apps/api validates requests by
 * looking the cookie up in the Session table (ADR-0008) — so the credentials
 * flow creates a DB session explicitly and the cookie carries its token (the
 * documented jwt.encode override). Nothing here touches any shop path (§2.2).
 */

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

/** Surfaces the distinct "verify your email first" login state (brief 04). */
class UnverifiedEmailError extends CredentialsSignin {
  override code = "unverified";
}

const adapter = createAuthAdapter();
const authAccounts = createAuthAccountRepository();

const SESSION_MAX_AGE_S = 30 * 24 * 60 * 60;

// OAuth connects (ADR-0004): a Google/Meta Account row IS the connected
// social. Env-gated — wired the moment credentials exist, absent otherwise.
const oauthProviders: Provider[] = [
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: { scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly" },
          },
        }),
      ]
    : []),
  ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
    ? [Facebook({ clientId: env.FACEBOOK_CLIENT_ID, clientSecret: env.FACEBOOK_CLIENT_SECRET })]
    : []),
];

const nextAuth = NextAuth({
  adapter,
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "database", maxAge: SESSION_MAX_AGE_S },
  pages: { signIn: "/signin" },
  providers: [
    ...oauthProviders,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsInput.safeParse(raw);
        if (!parsed.success) return null;
        const result = await verifyCredentials({ accounts: authAccounts }, parsed.data);
        if (!result.ok) {
          if (result.reason === "unverified") throw new UnverifiedEmailError();
          return null; // one generic failure for wrong email OR password
        }
        return { id: result.userId, email: parsed.data.email };
      },
    }),
  ],
  callbacks: {
    // Credentials sign-ins default to JWT cookies, which apps/api couldn't
    // validate — so create the DB session here and smuggle its token out
    // through jwt.encode below.
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials" && user?.id) {
        const session = await adapter.createSession!({
          sessionToken: randomUUID(),
          userId: user.id,
          expires: new Date(Date.now() + SESSION_MAX_AGE_S * 1000),
        });
        token.sessionToken = session.sessionToken;
      }
      return token;
    },
    // Expose the user id so server components can scope reads (getMyProfiles).
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  jwt: {
    async encode(params) {
      const token = params.token as { sessionToken?: string } | undefined;
      // The session cookie's value IS the DB session token (strategy:
      // "database" reads it straight against the Session table).
      if (token?.sessionToken) return token.sessionToken;
      // Anything else (OAuth state/PKCE cookies) keeps default encoding.
      return defaultJwtEncode(params);
    },
  },
});

// Explicit annotations — next-auth's inferred types aren't portable under pnpm
// (TS2742).
export const handlers = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
