import { Avatar, AvatarFallback, AvatarImage } from "@plugfolio/ui";
import { SocialsRow, type SocialLink } from "./socials-row";

/**
 * Creator page header (Dev Spec §06 region 1–2): centered 80px avatar, display
 * name (falls back to handle), muted @handle, then the required socials row.
 * Presentational; data fetching lives in the feature's hooks/api, not here.
 */
export type CreatorHeaderProps = {
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  /** Socials authored in dashboard Settings → "Your links". */
  socials?: SocialLink[];
};

export function CreatorHeader({
  handle,
  displayName,
  avatarUrl,
  socials = [],
}: CreatorHeaderProps) {
  const name = displayName ?? handle;
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <header className="flex flex-col items-center gap-3 py-8 text-center">
      <Avatar className="border-border size-20 border">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-muted text-muted-foreground font-display text-2xl">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h1 className="font-display tracking-display text-2xl font-semibold">{name}</h1>
        <p className="text-muted-foreground text-sm">@{handle}</p>
      </div>
      <SocialsRow links={socials} className="pt-1" />
    </header>
  );
}
