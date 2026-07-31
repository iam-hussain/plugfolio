import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PAGE_APPEARANCE_DEFAULTS,
  getMyProfileIdentity,
  getMyProfiles,
  listManagers,
  listMyProfileLinks,
  listYouTubeChannels,
  MAX_MANAGERS_PER_PROFILE,
} from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  Hint,
} from "@plugfolio/ui";
import { env } from "@/env";
import { SocialConnections } from "@/features/account-auth";
import { connectGoogle } from "@/features/account-auth/connect-social-action";
import {
  DashboardPageHeader,
  DeleteProfileButton,
  ManagerControls,
  PageAppearanceForm,
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

// Profile settings (DESIGN dashboard.html §5.23): public identity, how the
// page looks, links, connections, Managers, and the one destructive action.
//
// A Manager gets ONLY the picture control. Everything else is Admin-only
// (ADR-0004) and the boundary is SHOWN, never silently hidden — a Manager sees
// the field, sees the label saying it is Admin-only, and sees it disabled.
// Hiding it would leave them wondering what they are missing.
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
    <>
      <DashboardPageHeader
        title="Settings"
        eyebrow={`@${active.username}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/${active.username}`}>View page</Link>
          </Button>
        }
      />

      <DashBody>
        {/* Both roles see this card. Only the picture is a Manager's to change. */}
        <DashCard>
          <DashCardHead>
            <DashCardTitle>Public profile</DashCardTitle>
          </DashCardHead>
          <Hint>
            Your page lives at <b>plugfolio.com/{active.username}</b>. The username is fixed for now
            — choosing and renaming it lands with the social APIs, because a username is only yours
            if you can prove you own the handle.
          </Hint>
          <ProfileIdentityForm
            profileId={active.id}
            username={active.username}
            identity={identity}
            role={active.role}
          />
        </DashCard>

        <DashCard>
          <DashCardHead>
            <DashCardTitle>How it looks</DashCardTitle>
          </DashCardHead>
          <Hint>
            A small, closed set on purpose (ADR-0017) — accent, header, post layout and the greeting
            line. No setting here can make your Buy button hard to read.
          </Hint>
          <PageAppearanceForm
            profileId={active.id}
            role={active.role}
            appearance={{
              accent: identity.accent ?? PAGE_APPEARANCE_DEFAULTS.accent,
              headerStyle: identity.headerStyle ?? PAGE_APPEARANCE_DEFAULTS.headerStyle,
              gridStyle: identity.gridStyle ?? PAGE_APPEARANCE_DEFAULTS.gridStyle,
              greeting: identity.greeting,
            }}
          />
        </DashCard>

        {isAdmin ? (
          <>
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Your links</DashCardTitle>
              </DashCardHead>
              <Hint>
                These become the row of icons on your page. Saving replaces all five — an empty
                field removes that link.
              </Hint>
              <ProfileLinksForm profileId={active.id} links={links} />
            </DashCard>

            <DashCard>
              <DashCardHead>
                <DashCardTitle>Connections</DashCardTitle>
              </DashCardHead>
              <Hint>
                The socials this account owns — profile usernames come from their handles.
              </Hint>
              <SocialConnections youtube={youtube} connectAction={connectGoogle} bare />
            </DashCard>

            <DashCard>
              <DashCardHead>
                <DashCardTitle>Managers</DashCardTitle>
                <DashCardNote>
                  {managers.length} of {MAX_MANAGERS_PER_PROFILE}
                </DashCardNote>
              </DashCardHead>
              <Hint>
                Up to {MAX_MANAGERS_PER_PROFILE} people who can post and tag on this profile.
                Settings and connections stay yours.
              </Hint>
              <ManagerControls
                profileId={active.id}
                managers={managers}
                maxManagers={MAX_MANAGERS_PER_PROFILE}
              />
            </DashCard>

            <DashCard>
              <DeleteProfileButton profileId={active.id} username={active.username} />
            </DashCard>
          </>
        ) : (
          /* A Manager is told what they cannot do and why, rather than finding
             a shorter page and guessing. */
          <DashCard>
            <DashCardHead>
              <DashCardTitle>Admin-only</DashCardTitle>
            </DashCardHead>
            <Hint className="mb-0">
              Links, connections and Managers are the Admin&rsquo;s. You manage this profile&rsquo;s
              content — posts, products and shelves — and you can change its picture above.
            </Hint>
          </DashCard>
        )}
      </DashBody>
    </>
  );
}
