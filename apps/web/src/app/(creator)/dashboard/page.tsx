import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCreatorPage, getMyProfiles, getTraffic, listYouTubeChannels } from "@plugfolio/core";
import { env } from "@/env";
import { DashboardHome } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories, youtubeDeps } from "@/server/container";

// The creator's back room home (DESIGN dashboard.html §5.18): the profile you
// are editing, what needs doing, the profiles you can switch to, what the
// account is connected to, and the traffic all of it earned.
// Gated by session — an "act as yourself" surface, never a shop path (§2.2).
export const metadata: Metadata = { title: "Dashboard" };

type SearchParams = { profile?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const [profiles, connected, youtube] = await Promise.all([
    getMyProfiles({ profiles: repositories.profiles }, session.user.id),
    repositories.connections.hasAny(session.user.id),
    googleConfigured ? listYouTubeChannels(youtubeDeps, session.user.id) : null,
  ]);
  const active = pickActiveProfile(profiles, (await searchParams).profile);
  const [traffic, page] = active
    ? await Promise.all([
        getTraffic({ traffic: repositories.traffic }, active.id),
        getCreatorPage({ creatorPages: repositories.creatorPages }, active.username),
      ])
    : [null, null];
  const untaggedPosts = page?.posts.filter((post) => post.products.length === 0) ?? [];

  return (
    <DashboardHome
      profiles={profiles}
      active={active ?? null}
      connected={connected}
      youtube={youtube}
      traffic={traffic}
      untaggedPosts={untaggedPosts}
    />
  );
}
