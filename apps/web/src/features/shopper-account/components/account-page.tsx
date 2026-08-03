import type { AccessibleProfile, YouTubeConnectionView } from "@plugfolio/core";
import { AccountHero, Avatar, AvatarFallback, AvatarImage, cn, measure } from "@plugfolio/ui";
import { AccountShell, type AccountDestination } from "./account-shell";
import { AccountConnections } from "./account/account-connections";
import { AccountIdentity } from "./account/account-identity";
import { AccountLeaving } from "./account/account-leaving";
import { AccountRoles } from "./account/account-roles";
import { AccountSignIn } from "./account/account-signin";

/**
 * /account — the one settings page every role shares.
 *
 * Scope boundary, and it matters: this page is ACCOUNT-level — who you are,
 * how you sign in, and which roles this email holds. Profile-level settings
 * (the public page, its links, its Managers) live at /dashboard/settings and
 * are Admin-gated per profile.
 *
 * Shape: a hero that states the account once, then an index of destinations
 * and the one you opened (`AccountShell`). Presentational — the route fetches,
 * this composes, and each panel is its own file under `account/`.
 *
 * The index carries a **value per row**, built here because only this level
 * knows all five. That is what makes the extra tap worth taking: you read the
 * state of the whole account without opening anything.
 */
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
  const connected = youtube?.connected === true;
  const owned = profiles.filter((profile) => profile.role === "admin").length;

  // Every account shops (§2.2), so the hero's tag names the furthest hat it
  // holds — the one that says most about what this account is here to do.
  const role = business ? "Business" : profiles.length > 0 ? "Creator" : "Shopper";

  const destinations: readonly AccountDestination[] = [
    {
      id: "identity",
      label: "You",
      lead: "How you appear when you act as yourself — following a creator, or leaving a comment.",
      value: `@${handle}`,
      panel: <AccountIdentity name={name} image={image} handle={handle} />,
    },
    {
      id: "signin",
      label: "Signing in",
      lead: "Your email is your login — with your username as a second way in, and one password behind both.",
      value: email,
      panel: <AccountSignIn email={email} handle={handle} />,
    },
    {
      id: "roles",
      label: "Your roles",
      lead: "One account, as many hats as you want. These aren't separate logins or separate plans — they're things this same email can do.",
      value: [
        "Shopping",
        profiles.length > 0 ? `${owned} of ${maxProfiles} profiles` : null,
        business ? business.name : null,
      ]
        .filter(Boolean)
        .join(" · "),
      panel: (
        <AccountRoles
          handle={handle}
          profiles={profiles}
          maxProfiles={maxProfiles}
          business={business}
          connected={connected}
        />
      ),
    },
    {
      id: "connections",
      label: "Connections",
      lead: "Connecting proves who you are so a handle can't be squatted. It is not a login — you'll still sign in with your email and password.",
      value:
        youtube === null ? "Not configured" : connected ? "Google connected" : "Nothing connected",
      panel: <AccountConnections youtube={youtube} connectAction={connectAction} />,
    },
    {
      id: "leaving",
      label: "Leaving",
      lead: "Signing out ends this session. Deleting the account is handled by a person, not a button.",
      value: "Sign out · delete",
      panel: <AccountLeaving />,
    },
  ];

  return (
    <main className={cn(measure(), "pb-[clamp(48px,7vw,88px)] pt-[clamp(20px,3vw,34px)]")}>
      <p className="text-muted-foreground text-micro font-sans font-semibold uppercase tracking-[0.06em]">
        Account
      </p>
      <h1 className="font-display text-display-sm mt-1.5 font-bold leading-[1.1] tracking-[-0.035em]">
        Your account
      </h1>

      <div className="mt-4">
        <AccountHero
          handle={handle}
          name={name}
          email={email}
          role={role}
          avatar={
            <Avatar className="size-12 flex-none sm:size-14">
              {image ? <AvatarImage src={image} alt="" /> : null}
              <AvatarFallback className="text-primary font-display text-title font-bold">
                {(handle || email || "?").trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          }
        />
      </div>

      <AccountShell destinations={destinations} />
    </main>
  );
}
