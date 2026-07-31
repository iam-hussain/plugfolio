import type { AccessibleProfile, YouTubeConnectionView } from "@plugfolio/core";
import { AccountNav, cn, measure } from "@plugfolio/ui";
import { AccountConnections } from "./account/account-connections";
import { AccountIdentity } from "./account/account-identity";
import { AccountLeaving } from "./account/account-leaving";
import { AccountRoles } from "./account/account-roles";
import { AccountSignIn } from "./account/account-signin";

/**
 * /account — the one settings page every role shares (DESIGN account.html).
 *
 * Scope boundary, and it matters: this page is ACCOUNT-level — who you are,
 * how you sign in, and which roles this email holds. Profile-level settings
 * (the public page, its links, its Managers) live at /dashboard/settings and
 * are Admin-gated per profile.
 *
 * Presentational: the route fetches, this composes. Each section is its own
 * file under `account/` — they share nothing but the nav anchors, and keeping
 * them in one 350-line component made the boundary above easy to blur.
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
  return (
    <main
      className={cn(
        measure(),
        "grid gap-[clamp(24px,3vw,40px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)] min-[900px]:grid-cols-[210px_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-x-[clamp(36px,5vw,72px)]",
      )}
    >
      <AccountNav sections={SECTIONS} />

      <div>
        <p className="text-muted-foreground text-micro font-sans font-semibold uppercase tracking-[0.06em]">
          Account
        </p>
        <h1 className="font-display text-display mt-2 font-bold leading-[1.08] tracking-[-0.035em]">
          Your account
        </h1>

        <AccountIdentity email={email} name={name} image={image} handle={handle} />
        <AccountSignIn email={email} />
        <AccountRoles
          handle={handle}
          profiles={profiles}
          maxProfiles={maxProfiles}
          business={business}
          connected={youtube?.connected === true}
        />
        <AccountConnections youtube={youtube} connectAction={connectAction} />
        <AccountLeaving />
      </div>
    </main>
  );
}
