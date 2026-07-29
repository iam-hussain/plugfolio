import type { AccessibleProfile, YouTubeConnectionView } from "@plugfolio/core";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@plugfolio/ui";
import { Info } from "lucide-react";
import Link from "next/link";
import { SocialGlyph } from "@/features/creator-page";
import {
  AccountNav,
  AccountSection,
  ConnectionRow,
  Prerequisite,
  ProfileNewRow,
  ProfileRow,
  RoleBlock,
  RoleCopy,
  SettingRow,
  SettingRows,
} from "./account-shared";
import { HandleForm } from "./handle-form";

/**
 * /account — the one settings page every role shares (DESIGN account.html).
 *
 * Scope boundary, and it matters: this page is ACCOUNT-level — who you are,
 * how you sign in, and which roles this email holds. Profile-level settings
 * (the public page, its links, its Managers) live at /dashboard/settings and
 * are Admin-gated per profile.
 *
 * Presentational: the route fetches, this composes. Account deletion and an
 * email change are deliberately not self-serve — the product routes both
 * through support so a person confirms first (docs/implementation/support.md).
 */

const SECTIONS = [
  { id: "identity", label: "You" },
  { id: "signin", label: "Signing in" },
  { id: "roles", label: "Your roles" },
  { id: "connections", label: "Connections" },
  { id: "leaving", label: "Leaving" },
] as const;

export type AccountPageProps = {
  email: string;
  name: string | null;
  image: string | null;
  handle: string;
  /** Owned + managed (ADR-0004); the profile cap counts owned only. */
  profiles: readonly AccessibleProfile[];
  /** `MAX_PROFILES_PER_ACCOUNT` — passed in so this stays framework-free. */
  maxProfiles: number;
  business: { name: string } | null;
  /** Null when Google connect isn't configured on this server. */
  youtube: YouTubeConnectionView | null;
  /** Starts the Google OAuth connect — a connection, never a login. */
  connectAction: () => void | Promise<void>;
};

export function AccountPage({
  email,
  name,
  image,
  handle,
  profiles,
  maxProfiles,
  business,
  youtube,
  connectAction,
}: AccountPageProps) {
  const owned = profiles.filter((profile) => profile.role === "admin").length;
  const remaining = Math.max(0, maxProfiles - owned);
  const connected = youtube?.connected === true;
  const channels = youtube?.connected ? youtube.channels : [];

  return (
    <main className="mx-auto grid w-full max-w-[1180px] gap-[clamp(24px,3vw,40px)] px-5 pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)] lg:px-11 min-[900px]:grid-cols-[210px_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-x-[clamp(36px,5vw,72px)]">
      <AccountNav sections={SECTIONS} />

      <div>
        <p className="text-muted-foreground font-sans text-xs font-semibold uppercase tracking-[0.06em]">
          Account
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.875rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Your account
        </h1>

        <section id="identity" className="mt-5 scroll-mt-24">
          <div className="border-border bg-card rounded-card flex flex-wrap items-center gap-4 border px-5 py-5">
            <Avatar className="size-[72px]">
              {image ? <AvatarImage src={image} alt="" /> : null}
              <AvatarFallback className="bg-active text-primary font-display text-2xl font-bold">
                {(handle || email || "?").trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <b className="font-display block text-[1.375rem] font-bold tracking-[-0.02em]">
                {name ?? `@${handle}`}
              </b>
              <span className="text-muted-foreground mt-0.5 block truncate text-[0.9375rem]">
                @{handle} · {email}
              </span>
            </div>
          </div>

          <AccountSection
            title="You"
            lead="How you appear when you act as yourself — following a creator, or leaving a comment."
          >
            <SettingRows>
              <SettingRow
                label="Name"
                value={name ?? "Not set"}
                hint="Comes from the social you connected. Comments are signed with your handle, never your name or email."
              />
              <SettingRow
                label="Member handle"
                value={`@${handle}`}
                hint="The name on your comments. Not a creator page, and never your email — that stays private."
              >
                <HandleForm currentHandle={handle} />
              </SettingRow>
              {/* ponytail: photo is whatever the connected social gave us —
                  an uploader lands with media storage, not before. */}
              <SettingRow
                label="Profile photo"
                value={image ? "Set" : "Not set"}
                hint="Shown beside your comments and in the account menu. It follows your connected account."
              />
            </SettingRows>
          </AccountSection>
        </section>

        <AccountSection
          id="signin"
          title="Signing in"
          lead="Your email is your login — there is no username to remember, and no magic link to wait for. One email, one password, one step."
        >
          <SettingRows>
            <SettingRow
              label="Email"
              value={email}
              hint="This is your login ID. Changing it needs the new address verified first, so support makes the swap."
              action={
                <Button variant="secondary" asChild>
                  <Link href={{ pathname: "/support", query: { category: "change_email" } }}>
                    Change email
                  </Link>
                </Button>
              }
            />
            <SettingRow
              label="Password"
              value="Set by you"
              hint="At least 8 characters. We email a link so the change is confirmed from your inbox."
              action={
                <Button variant="secondary" asChild>
                  <Link href="/forgot">Change password</Link>
                </Button>
              }
            />
            <SettingRow
              label="Locked out?"
              value={`If you can't reach ${email} any more, support can move you across.`}
              hint="You don't need to be signed in to ask."
              action={
                <Button variant="secondary" asChild>
                  <Link href={{ pathname: "/support", query: { category: "lost_email_access" } }}>
                    Get help
                  </Link>
                </Button>
              }
            />
          </SettingRows>
        </AccountSection>

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
                    href={`/dashboard?profile=${profile.id}`}
                    username={profile.username}
                    meta={`plugfolio.com/${profile.username}`}
                    badge={profile.role === "admin" ? "Admin" : "Manager"}
                  />
                ))}
                {remaining > 0 ? (
                  <ProfileNewRow href="/dashboard" label={`+ New profile · ${remaining} left`} />
                ) : null}
              </div>
            </RoleBlock>
          ) : (
            <RoleBlock role="creator" title="Creator" note="Not set up">
              <RoleCopy>
                Turn your posts into a page where everything is shoppable. Free to start, and
                Plugfolio never handles your money.
              </RoleCopy>
              {connected ? null : (
                <Prerequisite icon={<Info className="size-4" />}>
                  You&apos;ll connect a Google or Meta account first. That&apos;s what proves a
                  handle is yours, so nobody else can take it.
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
                Hiring creators rather than being one? A business lets you post briefs and negotiate
                in one thread. One business per account.
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

        <AccountSection
          id="connections"
          title="Connected accounts"
          lead="Connecting proves who you are so a handle can't be squatted. It is not a login — you'll still sign in with your email and password."
        >
          <div className="border-border bg-card rounded-tile divide-border divide-y overflow-hidden border">
            <ConnectionRow
              glyph={<SocialGlyph platform="youtube" />}
              title="Google · YouTube"
              detail={
                youtube === null
                  ? "Google connect isn't configured on this server yet."
                  : connected
                    ? `Connected · ${channels.length} ${channels.length === 1 ? "channel" : "channels"}`
                    : "Not connected"
              }
              status={youtube === null ? "unavailable" : connected ? "connected" : "disconnected"}
              action={
                youtube === null ? undefined : (
                  <form action={connectAction}>
                    <Button type="submit" variant="secondary">
                      {connected ? "Reconnect" : "Connect"}
                    </Button>
                  </form>
                )
              }
            />
            <ConnectionRow
              glyph={<SocialGlyph platform="instagram" />}
              title="Meta · Instagram"
              detail="Coming next — there's no Instagram gateway yet."
              status="unavailable"
            />
          </div>
          <p className="text-muted-foreground mt-3.5 max-w-[58ch] text-[0.9375rem] leading-[1.55]">
            A connection can&apos;t be removed while a profile depends on it. Delete those profiles
            first, and we&apos;ll say which they are.
          </p>
        </AccountSection>

        <AccountSection id="leaving" title="Leaving">
          <div className="border-border flex flex-wrap items-center gap-3 border-t pt-6">
            <p className="text-muted-foreground m-0 flex-1 basis-[320px] text-[0.9375rem] leading-[1.55]">
              Signing out ends this session on this device. Nothing is removed.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-muted-foreground m-0 flex-1 basis-[320px] text-[0.9375rem] leading-[1.55]">
              Deleting your account and its data is handled by a person, not a button — so we can
              confirm it&apos;s really you and tell you exactly what goes.
            </p>
            <Button variant="secondary" asChild>
              <Link href={{ pathname: "/support", query: { category: "delete_account" } }}>
                Request deletion
              </Link>
            </Button>
          </div>
        </AccountSection>
      </div>
    </main>
  );
}
