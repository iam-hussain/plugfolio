import { createAuthAdapter } from "@plugfolio/db";
import NextAuth, { type DefaultSession, type NextAuthResult } from "next-auth";
import type { Provider } from "next-auth/providers";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
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
  adapter: createAuthAdapter(),
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "database" },
  providers: [
    ...oauthProviders,
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
