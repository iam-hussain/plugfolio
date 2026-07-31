import type { YouTubeConnectionView } from "@plugfolio/core";
import { AccountSection, Button, ConnectionRow, SocialGlyph } from "@plugfolio/ui";

/**
 * "Connected accounts" — what proves a handle is really yours.
 *
 * The lead says the thing that keeps getting mistaken: connecting is **not** a
 * login (ADR-0012). Sign-in is always email + password; a connection only
 * establishes that the social account behind a username belongs to this person,
 * so a handle can't be squatted.
 */
export type AccountConnectionsProps = {
  /** Null when Google connect isn't configured on this server. */
  youtube: YouTubeConnectionView | null;
  /** Starts the Google OAuth connect — a connection, never a login. */
  connectAction: () => void | Promise<void>;
};

export function AccountConnections({ youtube, connectAction }: AccountConnectionsProps) {
  const connected = youtube?.connected === true;
  const channels = youtube?.connected ? youtube.channels : [];

  return (
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
      <p className="text-muted-foreground mt-3.5 max-w-[58ch] text-copy leading-[1.55]">
        A connection can&apos;t be removed while a profile depends on it. Delete those profiles
        first, and we&apos;ll say which they are.
      </p>
    </AccountSection>
  );
}
