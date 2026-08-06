import Link from "next/link";
import type {
  ManagerView,
  ProfileIdentity,
  ProfileLinkView,
  ProfileRole,
  YouTubeConnectionView,
} from "@plugfolio/core";
import { MAX_MANAGERS_PER_PROFILE } from "@plugfolio/core";
import {
  Button,
  DashBody,
  DashCard,
  DashCardHead,
  DashCardNote,
  DashCardTitle,
  Hint,
} from "@plugfolio/ui";
import { SocialConnections } from "@/features/account-auth";
import { connectGoogle } from "@/features/account-auth/connect-social-action";
import { DashboardPageHeader } from "./dashboard-shell";
import { DeleteProfileButton } from "./delete-profile-button";
import { ManagerControls } from "./manager-controls";
import { ProfileIdentityForm } from "./profile-identity-form";
import { ProfileLinksForm } from "./profile-links-form";

/**
 * Profile settings (v2 §dSettings) — the profile's DATA, one card each. A
 * Manager gets ONLY the picture control (ADR-0004), and the boundary is SHOWN,
 * never silently hidden.
 *
 * The route above it loads and nothing else (§5: `app/` is thin).
 */
export type ProfileSettingsViewProps = {
  profileId: string;
  username: string;
  role: ProfileRole;
  identity: ProfileIdentity;
  managers: readonly ManagerView[];
  youtube: YouTubeConnectionView | null;
  links: readonly ProfileLinkView[];
};

export function ProfileSettingsView({
  profileId,
  username,
  role,
  identity,
  managers,
  youtube,
  links,
}: ProfileSettingsViewProps) {
  const isAdmin = role === "admin";

  return (
    <>
      <DashboardPageHeader
        title="Settings"
        eyebrow={`@${username}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/${username}`}>View page</Link>
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
            Your page lives at <b>plugfolio.com/{username}</b>. The username is fixed for now —
            choosing and renaming it lands with the social APIs, because a username is only yours if
            you can prove you own the handle.
          </Hint>
          <ProfileIdentityForm
            profileId={profileId}
            username={username}
            identity={identity}
            role={role}
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
              <Link href={`/${username}`}>Change the look on your page ↗</Link>
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
              <ProfileLinksForm profileId={profileId} links={links} />
            </DashCard>

            {/* ── 4 · Connections — what feeds the page ── */}
            <DashCard>
              <DashCardHead>
                <DashCardTitle>Connected accounts</DashCardTitle>
              </DashCardHead>
              <Hint>
                The socials this account owns — usernames come from their handles, and posts import
                from them. You can re-authenticate any time; a provider can&apos;t be fully
                disconnected while a profile still depends on it.
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
                profileId={profileId}
                managers={managers}
                maxManagers={MAX_MANAGERS_PER_PROFILE}
              />
            </DashCard>

            {/* ── 6 · The one destructive action, last ── */}
            <DashCard>
              <DeleteProfileButton profileId={profileId} username={username} />
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
              You manage this page: posts, tagging, things, shelves, collabs and traffic — and you
              can change its picture above. Links, connections and Managers stay with the Admin.
            </Hint>
          </DashCard>
        )}
      </DashBody>
    </>
  );
}
