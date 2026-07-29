import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  MAX_PROFILES_PER_ACCOUNT,
  getMemberHandle,
  getMyBusiness,
  getMyProfiles,
  listYouTubeChannels,
} from "@plugfolio/core";
import { env } from "@/env";
import { AccountPage } from "@/features/shopper-account";
import { auth, signIn } from "@/server/auth";
import { businessCollabDeps, repositories, youtubeDeps } from "@/server/container";

// Account settings (DESIGN account.html): the one settings page every role
// shares — who you are, how you sign in, and which roles this email holds.
// Profile-level settings live at /dashboard/settings, Admin-gated per profile.
export const metadata: Metadata = { title: "Account" };

// Starts the Google OAuth connect (ADR-0004) and comes back here — the signed-in
// user means Auth.js links the Account row rather than logging anyone in.
async function connectGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/account" });
}

export default async function AccountRoute() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const [handle, profiles, business, youtube] = await Promise.all([
    getMemberHandle({ users: repositories.users }, session.user.id),
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    getMyBusiness(businessCollabDeps, session.user.id),
    googleConfigured ? listYouTubeChannels(youtubeDeps, session.user.id) : null,
  ]);

  return (
    <AccountPage
      email={session.user.email ?? ""}
      name={session.user.name ?? null}
      image={session.user.image ?? null}
      handle={handle}
      profiles={profiles}
      maxProfiles={MAX_PROFILES_PER_ACCOUNT}
      business={business}
      youtube={youtube}
      connectAction={connectGoogle}
    />
  );
}
