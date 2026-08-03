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
        {/* ── 1 · Identity — who this page is ── */}
        <DashCard>
          <DashCardHead>
            <DashCardTitle>Identity</DashCardTitle>
          </DashCardHead>
          <Hint>
            Your page lives at <b>plugfolio.com/{active.username}</b>. The username is fixed for
            now — choosing and renaming it lands with the social APIs, because a username is only
            yours if you can prove you own the handle.
          </Hint>
          <ProfileIdentityForm
            profileId={active.id}
            username={active.username}
            identity={identity}
            role={active.role}
          />
        </DashCard>

        {/* ── 2 · The look — a pointer, not a second editor ── */}
        <DashCard>
          <DashCardHead>
            <DashCardTitle>How it looks</DashCardTitle>
          </DashCardHead>
          <Hint className="mb-3">
            Accent, header, cover treatment, wall layout and the link row are edited{" "}
            <b>on the live page</b>, where every pick lands exactly where visitors see it. Nothing
            there can make your Buy button hard to read — the set is closed on purpose.
          </Hint>
          {isAdmin ? (
            <Button variant="action" asChild>
              <Link href={`/${active.username}`}>Change the look on your page ↗</Link>
            </Button>
          ) : (
            <p className="text-faint text-label">The look stays with the Admin.</p>
          )}
        </DashCard>

        {isAdmin ? (
          <>
            {/* ── 3 · Links — where the page points ── */}
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Your links</DashCardTitle>
              </DashCardHead>
              <Hint>
                These become the row under your name. Saving replaces all five — an empty field
                removes that link.
              </Hint>
              <ProfileLinksForm profileId={active.id} links={links} />
            </DashCard>

            {/* ── 4 · Connections — what feeds the page ── */}
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Connected accounts</DashCardTitle>
              </DashCardHead>
              <Hint>
                The socials this account owns — usernames come from their handles, and posts
                import from them. You can re-authenticate any time; a provider can&apos;t be
                fully disconnected while a profile still depends on it.
              </Hint>
              <SocialConnections youtube={youtube} connectAction={connectGoogle} bare />
            </DashCard>

            {/* ── 5 · Managers — who helps ── */}
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Managers</DashCardTitle>
                <DashCardNote>
                  {managers.length} of {MAX_MANAGERS_PER_PROFILE}
                </DashCardNote>
              </DashCardHead>
              <Hint>
                Up to {MAX_MANAGERS_PER_PROFILE} people who can post, tag and curate on this
                profile. Settings and connections stay yours.
              </Hint>
              <ManagerControls
                profileId={active.id}
                managers={managers}
                maxManagers={MAX_MANAGERS_PER_PROFILE}
              />
            </DashCard>

            {/* ── 6 · The one destructive action, last ── */}
            <DashCard>
              <DeleteProfileButton profileId={active.id} username={active.username} />
            </DashCard>
          </>
        ) : (
          /* A Manager is told what they cannot do and why, rather than finding
             a shorter page and guessing (v2 §dSettings isManager). */
          <DashCard>
            <DashCardHead>
              <DashCardTitle>Settings belong to the Admin</DashCardTitle>
            </DashCardHead>
            <Hint className="mb-0">
              You manage this page: posts, tagging, things, shelves, collabs and traffic — and
              you can change its picture above. Links, connections and Managers stay with the
              Admin.
            </Hint>
          </DashCard>
        )}
      </DashBody>
    </>
  );
}
