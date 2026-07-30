import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCreatorPage,
  getMyProfiles,
  getTraffic,
  listYouTubeChannels,
  MAX_PROFILES_PER_ACCOUNT,
} from "@plugfolio/core";
import {
  ActiveProfile,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DashCard,
  DashCardAction,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  DashBody,
  EmptyState,
  Nudge,
  ProfileChip,
  ProfileChips,
} from "@plugfolio/ui";
import { env } from "@/env";
import { SocialConnections } from "@/features/account-auth";
import { connectGoogle } from "@/features/account-auth/connect-social-action";
import {
  DashboardPageHeader,
  DashboardShell,
  NewProfileButton,
} from "@/features/product-tagging";
import { TrafficSummaryView } from "@/features/traffic";
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
  const untagged = page?.posts.filter((post) => post.products.length === 0).length ?? 0;

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Dashboard" eyebrow={session.user.email ?? undefined} />

      <DashBody>
        {profiles.length === 0 ? (
          <EmptyState
            title="Create your first profile"
            action={connected ? <NewProfileButton /> : null}
          >
            {connected
              ? "Your account is connected — create a profile to get your shoppable page."
              : "Connect a Google or Meta account below, then create a profile to get your shoppable page."}
          </EmptyState>
        ) : (
          <>
            {active ? (
              <DashCard>
                <ActiveProfile
                  avatar={
                    <Avatar className="size-[60px] flex-none">
                      {page?.avatarUrl ? <AvatarImage src={page.avatarUrl} alt="" /> : null}
                      <AvatarFallback className="bg-active text-primary font-display text-title font-extrabold">
                        {active.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  }
                  handle={`@${active.username}`}
                  url={
                    <>
                      plugfolio.com/{active.username}
                      {active.role === "manager" ? " · you manage this profile" : ""}
                    </>
                  }
                  action={
                    <Button variant="outline" asChild>
                      <Link href={`/${active.username}`}>View page</Link>
                    </Button>
                  }
                />

                {/* Only when there is something to tag. A nudge that is always
                    there is wallpaper; this one carries the count. */}
                {untagged > 0 ? (
                  <Nudge
                    action={
                      <Button asChild>
                        <Link
                          href={{
                            pathname: "/dashboard/posts",
                            query: { profile: active.id, filter: "untagged" },
                          }}
                        >
                          Tag them
                        </Link>
                      </Button>
                    }
                  >
                    <b>
                      {untagged} {untagged === 1 ? "post has" : "posts have"} no products tagged.
                    </b>{" "}
                    Tag them to make those posts shoppable.
                  </Nudge>
                ) : null}
              </DashCard>
            ) : null}

            <DashCard>
              <DashCardHead>
                <DashCardTitle>Profiles</DashCardTitle>
                <DashCardNote>
                  {profiles.length} of {MAX_PROFILES_PER_ACCOUNT}
                </DashCardNote>
                <DashCardAction>
                  <NewProfileButton />
                </DashCardAction>
              </DashCardHead>
              <ProfileChips>
                {profiles.map((profile) => (
                  <ProfileChip
                    key={profile.id}
                    current={profile.id === active?.id}
                    role={profile.role === "manager" ? "manager" : undefined}
                    avatar={
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-active text-primary text-[10px] font-bold">
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    }
                    asChild
                  >
                    <Link href={`/dashboard?profile=${profile.id}`}>@{profile.username}</Link>
                  </ProfileChip>
                ))}
              </ProfileChips>
            </DashCard>
          </>
        )}

        <SocialConnections youtube={youtube} connectAction={connectGoogle} />

        {active && traffic ? (
          <DashCard>
            <DashCardHead>
              <DashCardTitle>Traffic · @{active.username}</DashCardTitle>
              <DashCardNote>All time</DashCardNote>
            </DashCardHead>
            <TrafficSummaryView summary={traffic} pageHref={`/${active.username}` as Route} />
          </DashCard>
        ) : null}
      </DashBody>
    </DashboardShell>
  );
}
