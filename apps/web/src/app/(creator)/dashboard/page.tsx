import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCreatorPage,
  getEarnings,
  getMyProfiles,
  listYouTubeChannels,
} from "@plugfolio/core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@plugfolio/ui";
import { ExternalLink, Tag } from "lucide-react";
import { env } from "@/env";
import { SocialConnections } from "@/features/account-auth";
import { EarningsSummaryView } from "@/features/earnings";
import {
  DashboardPageHeader,
  DashboardShell,
  NewProfileButton,
} from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { repositories, youtubeDeps } from "@/server/container";

// The creator's back room home (lean journey: four tabs, not thirteen).
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
  const [earnings, page] = active
    ? await Promise.all([
        getEarnings({ earnings: repositories.earnings }, active.id),
        getCreatorPage({ creatorPages: repositories.creatorPages }, active.username),
      ])
    : [null, null];
  const untagged = page?.posts.filter((post) => post.products.length === 0).length ?? 0;

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Dashboard" eyebrow={session.user.email ?? undefined} />

      {profiles.length === 0 ? (
        <Empty className="mb-8 border">
          <EmptyHeader>
            <EmptyTitle>Create your first profile</EmptyTitle>
            <EmptyDescription>
              {connected
                ? "Your account is connected — create a profile to get your shoppable page."
                : "Connect a Google or Meta account below, then create a profile to get your shoppable page."}
            </EmptyDescription>
          </EmptyHeader>
          {connected ? (
            <EmptyContent>
              <NewProfileButton />
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <>
          {active ? (
            <Card className="mb-6">
              <CardContent className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-muted text-foreground">
                    {active.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">@{active.username}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    plugfolio.com/{active.username}
                    {active.role === "manager" ? " · you manage this profile" : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${active.username}`}>
                    <ExternalLink className="size-4" />
                    View page
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {active && untagged > 0 ? (
            <Alert className="mb-6">
              <Tag className="size-4" />
              <AlertTitle>
                {untagged} {untagged === 1 ? "post has" : "posts have"} no products tagged
              </AlertTitle>
              <AlertDescription>
                <Link
                  href={{
                    pathname: "/dashboard/posts",
                    query: { profile: active.id, filter: "untagged" },
                  }}
                  className="underline underline-offset-4"
                >
                  Tag them to make those posts shoppable →
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          <section aria-label="Profiles" className="pb-8">
            <div className="flex items-center justify-between pb-3">
              <h2 className="font-medium">Profiles</h2>
              <NewProfileButton />
            </div>
            <ul className="flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <Link
                    href={`/dashboard?profile=${profile.id}`}
                    className={cn(
                      "rounded-pill inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm",
                      profile.id === active?.id
                        ? "border-primary font-medium"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    @{profile.username}
                    {profile.role === "manager" ? <Badge variant="outline">manager</Badge> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <SocialConnections youtube={youtube} />

      {active && earnings ? (
        <section aria-label="Earnings">
          <h2 className="pb-4 font-medium">
            Earnings · <span className="text-muted-foreground">@{active.username}</span>
          </h2>
          <EarningsSummaryView summary={earnings} />
        </section>
      ) : null}
    </DashboardShell>
  );
}
