import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getMyProfileIdentity,
  getMyProfiles,
  listManagers,
  listMyProfileLinks,
  listYouTubeChannels,
  MAX_MANAGERS_PER_PROFILE,
} from "@plugfolio/core";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plugfolio/ui";
import { ExternalLink } from "lucide-react";
import { env } from "@/env";
import { SocialConnections } from "@/features/account-auth";
import { connectGoogle } from "@/features/account-auth/connect-social-action";
import {
  DashboardPageHeader,
  DashboardShell,
  DeleteProfileButton,
  ManagerControls,
  ProfileIdentityForm,
  ProfileLinksForm,
} from "@/features/product-tagging";
import { pickActiveProfile } from "@/lib/pick-active-profile";
import { auth } from "@/server/auth";
import {
  profileIdentityDeps,
  profileLinkDeps,
  profileManagerDeps,
  repositories,
  youtubeDeps,
} from "@/server/container";

// Profile settings (brief 10): public identity, links, connections, Managers,
// and the one destructive action. A Manager gets ONLY the picture control —
// everything else is Admin-only (ADR-0004) and visibly labeled so, never
// silently hidden. Username picking from connected handles lands with the
// social APIs.
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
    <DashboardShell profiles={profiles} active={active}>
      <DashboardPageHeader
        title="Settings"
        eyebrow={`@${active.username}`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${active.username}`}>
              <ExternalLink className="size-4" />
              View page
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              Your page lives at plugfolio.com/{active.username}. Usernames come from the handles
              you own on connected socials — picking yours lands with social import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileIdentityForm
              profileId={active.id}
              username={active.username}
              identity={identity}
              role={active.role}
            />
          </CardContent>
        </Card>

        {isAdmin ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your links</CardTitle>
                <CardDescription>
                  The socials row on your public page — Instagram, YouTube, TikTok, Facebook, and
                  your site. Paste the URLs; connected socials will auto-fill later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileLinksForm profileId={active.id} links={links} />
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
                <SocialConnections youtube={youtube} connectAction={connectGoogle} bare />
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

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle>Danger zone</CardTitle>
              </CardHeader>
              <CardContent>
                <DeleteProfileButton profileId={active.id} username={active.username} />
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Links, connections and Managers are Admin-only — you manage this profile&apos;s
            content, and can change its picture above.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
