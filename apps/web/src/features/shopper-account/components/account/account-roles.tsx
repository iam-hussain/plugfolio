import type { AccessibleProfile } from "@plugfolio/core";
import {
  AccountSection,
  Button,
  Prerequisite,
  ProfileNewRow,
  ProfileRow,
  RoleBlock,
  RoleCopy,
} from "@plugfolio/ui";
import { Info } from "lucide-react";
import Link from "next/link";

/**
 * "Your roles" — one account, as many hats as it wants.
 *
 * These are not separate logins or separate plans; they are things this same
 * email can do (ADR-0004). Shopping is always on and is listed first to say so:
 * buying never needed the account and still doesn't (§2.2).
 */
export type AccountRolesProps = {
  handle: string;
  /** Owned + managed (ADR-0004); the profile cap counts owned only. */
  profiles: readonly AccessibleProfile[];
  maxProfiles: number;
  business: { name: string } | null;
  /** A social must be connected before a handle can be claimed. */
  connected: boolean;
};

export function AccountRoles({
  handle,
  profiles,
  maxProfiles,
  business,
  connected,
}: AccountRolesProps) {
  const owned = profiles.filter((profile) => profile.role === "admin").length;
  const remaining = Math.max(0, maxProfiles - owned);

  return (
    <AccountSection
      id="roles"
      title="Your roles"
      lead="One account, as many hats as you want. These aren't separate logins or separate plans — they're things this same email can do."
    >
      <RoleBlock
        role="shopper"
        title="Shopping"
        note="Always on"
        action={
          <Button variant="secondary" asChild>
            <Link href="/following">Following</Link>
          </Button>
        }
      >
        <RoleCopy>
          Follow creators and leave comments as @{handle}. Buying never needed this account and
          still doesn&apos;t.
        </RoleCopy>
      </RoleBlock>

      {profiles.length > 0 ? (
        <RoleBlock
          role="creator"
          title="Creator"
          note={`${owned} of ${maxProfiles} profiles used`}
          action={
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          }
        >
          <RoleCopy>
            Each profile is its own page with its own username. A profile&apos;s public details,
            links and Managers are edited in that profile&apos;s own settings, not here.
          </RoleCopy>
          <div className="mt-4 grid gap-2">
            {profiles.map((profile) => (
              <ProfileRow
                key={profile.id}
                asChild
                username={profile.username}
                meta={`plugfolio.com/${profile.username}`}
                badge={profile.role === "admin" ? "Admin" : "Manager"}
              >
                <Link href={`/dashboard?profile=${profile.id}`} />
              </ProfileRow>
            ))}
            {remaining > 0 ? (
              <ProfileNewRow asChild label={`+ New profile · ${remaining} left`}>
                <Link href="/dashboard" />
              </ProfileNewRow>
            ) : null}
          </div>
        </RoleBlock>
      ) : (
        <RoleBlock role="creator" title="Creator" note="Not set up">
          <RoleCopy>
            Turn your posts into a page where everything is shoppable. Free to start, and Plugfolio
            never handles your money.
          </RoleCopy>
          {connected ? null : (
            <Prerequisite icon={<Info className="size-4" />}>
              You&apos;ll connect a Google or Meta account first. That&apos;s what proves a handle
              is yours, so nobody else can take it.
            </Prerequisite>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={connected ? "/dashboard" : "#connections"}>
                {connected ? "Create your first profile" : "Connect a social to start"}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/for-creators">What creators get</Link>
            </Button>
          </div>
        </RoleBlock>
      )}

      {business ? (
        <RoleBlock
          role="business"
          title="Business"
          note={`${business.name} · one business per account`}
          action={
            <Button variant="secondary" asChild>
              <Link href="/collabs">Open collabs</Link>
            </Button>
          }
        >
          <RoleCopy>
            Post briefs to the open board and run collab threads. Payment settles off-platform —
            Plugfolio takes no cut.
          </RoleCopy>
        </RoleBlock>
      ) : (
        <RoleBlock role="business" title="Business" note="Not set up">
          <RoleCopy>
            Hiring creators rather than being one? A business lets you post briefs and negotiate in
            one thread. One business per account.
          </RoleCopy>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/collabs">Create a business</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/for-business">What businesses get</Link>
            </Button>
          </div>
        </RoleBlock>
      )}
    </AccountSection>
  );
}
