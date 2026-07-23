import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfiles, listManagers, listYouTubeChannels, MAX_MANAGERS_PER_PROFILE } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@plugfolio/ui";
import { ExternalLink } from "lucide-react";
import { env } from "@/env";
import { SocialConnections } from "@/features/account-auth";
import { DashboardPageHeader, DashboardShell, ManagerControls } from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import { profileManagerDeps, repositories, youtubeDeps } from "@/server/container";

// Profile settings (brief 10): public identity, connections, and the people
// who help run the profile. Admin-only surface (ADR-0004): Managers see every
// tab EXCEPT this one. Username picking from connected handles lands with
// the social APIs; delete-profile is deferred with it.
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
  if (!active || active.role !== "admin") redirect("/dashboard");

  const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const [managers, youtube] = await Promise.all([
    listManagers(profileManagerDeps, session.user.id, active.id),
    googleConfigured ? listYouTubeChannels(youtubeDeps, session.user.id) : null,
  ]);

  return (
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader title="Settings" eyebrow={`@${active.username}`} />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              Your page lives at plugfolio.com/{active.username}. Usernames come from the handles
              you own on connected socials — picking yours lands with social import.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-muted text-foreground">
                {active.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">@{active.username}</p>
              <p className="text-muted-foreground truncate text-xs">plugfolio.com/{active.username}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${active.username}`}>
                <ExternalLink className="size-4" />
                View page
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
            <CardDescription>
              The socials this account owns — profile usernames come from their handles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialConnections youtube={youtube} bare />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Managers · {managers.length} of {MAX_MANAGERS_PER_PROFILE}
            </CardTitle>
            <CardDescription>
              Up to {MAX_MANAGERS_PER_PROFILE} people who can post and tag on this profile.
              Settings and connections stay yours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManagerControls
              profileId={active.id}
              managers={managers}
              maxManagers={MAX_MANAGERS_PER_PROFILE}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
