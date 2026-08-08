import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getMyProfileIdentity,
  getMyProfiles,
  listManagers,
  listMyProfileLinks,
  listYouTubeChannels,
} from "@plugfolio/core";
import { env } from "@/env";
import { ProfileSettingsView } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import {
  profileIdentityDeps,
  profileLinkDeps,
  profileManagerDeps,
  repositories,
  youtubeDeps,
} from "@/server/container";

// Profile settings (v2 §dSettings) — the profile's DATA, one card each, in
// the order a person needs them: who the page is (identity), where it points
// (links), what feeds it (connections), who helps (Managers), and the one
// destructive action last. How the page LOOKS is deliberately not here: the
// look is edited on the live page itself ("Change the look"), where every
// pick lands exactly where visitors see it — two editors for one setting is
// how they drift apart.
//
// A Manager gets ONLY the picture control (ADR-0004), and the boundary is
// SHOWN, never silently hidden.
export const metadata: Metadata = { title: "Settings" };

type SearchParams = { profile?: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const profiles = await getMyProfiles({ profiles: repositories.profiles }, session.user.id);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  if (!active) redirect("/dashboard");
  const isAdmin = active.role === "admin";

  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const [identity, managers, youtube, links] = await Promise.all([
    getMyProfileIdentity(profileIdentityDeps, session.user.id, active.id),
    isAdmin ? listManagers(profileManagerDeps, session.user.id, active.id) : [],
    isAdmin && googleConfigured ? listYouTubeChannels(youtubeDeps, session.user.id) : null,
    isAdmin ? listMyProfileLinks(profileLinkDeps, session.user.id, active.id) : [],
  ]);

  return (
    <ProfileSettingsView
      profileId={active.id}
      username={active.username}
      role={active.role}
      identity={identity}
      managers={managers}
      youtube={youtube}
      links={links}
    />
  );
}
