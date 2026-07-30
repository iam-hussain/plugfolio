import type { YouTubeConnectionView } from "@plugfolio/core";
import {
  Button,
  ConnectedAs,
  Connection,
  ConnectionChannel,
  Connections,
  DashCard,
  DashCardHead,
  DashCardTitle,
  Hint,
  SocialGlyph,
} from "@plugfolio/ui";

/**
 * Account-level social connections (ADR-0004, DESIGN dashboard.html §5.15):
 * connect Google, then show the YouTube channels it exposes — the pool profile
 * usernames are picked from. Server component; `youtube` is null when the
 * OAuth app isn't configured.
 *
 * Meta is drawn as a real row rather than omitted, because "coming next" is
 * information and a missing row is not.
 *
 * The connect action arrives as a prop: importing it here would pull
 * `@/server/auth` into every barrel that re-exports this file, and from there
 * into anything that renders outside a Next server (Storybook, tests).
 */

const subscriberFormat = new Intl.NumberFormat("en", { notation: "compact" });

export function SocialConnections({
  youtube,
  connectAction,
  bare = false,
}: {
  youtube: YouTubeConnectionView | null;
  /** Starts the Google OAuth connect — a connection, never a login. */
  connectAction: () => void | Promise<void>;
  /** Skip the card wrapper — for callers that supply their own. */
  bare?: boolean;
}) {
  const channels = youtube?.connected ? youtube.channels : [];

  const body = (
    <Connections>
      <Connection
        icon={<SocialGlyph platform="youtube" />}
        name="Google · YouTube"
        status={
          youtube === null ? (
            "Not configured on this server yet"
          ) : youtube.connected ? (
            <ConnectedAs>Connected</ConnectedAs>
          ) : (
            "Connect to claim a username you own"
          )
        }
        action={
          youtube === null ? null : (
            <form action={connectAction}>
              <Button
                type="submit"
                variant="outline"
                className="text-micro min-h-10 flex-none px-4 py-2.5"
              >
                {youtube.connected ? "Reconnect" : "Connect"}
              </Button>
            </form>
          )
        }
        channels={
          channels.length > 0
            ? channels.map((channel) => (
                <ConnectionChannel key={channel.id}>
                  {channel.handle ?? channel.title}
                  {channel.subscriberCount !== null
                    ? ` · ${subscriberFormat.format(channel.subscriberCount)}`
                    : null}
                </ConnectionChannel>
              ))
            : youtube?.connected
              ? // Connected but nothing readable — say which of the two it is.
                [
                  <ConnectionChannel key="none">
                    No channels readable — reconnect to refresh access
                  </ConnectionChannel>,
                ]
              : undefined
        }
      />
      <Connection
        icon={<SocialGlyph platform="instagram" />}
        name="Meta · Instagram"
        status="Coming next — no gateway yet"
        action={
          <Button
            variant="outline"
            disabled
            className="text-micro min-h-10 flex-none px-4 py-2.5"
          >
            Connect
          </Button>
        }
      />
    </Connections>
  );

  if (bare) return body;

  return (
    <DashCard>
      <DashCardHead>
        <DashCardTitle>Connections</DashCardTitle>
      </DashCardHead>
      <Hint>
        Connect at least one to create a profile. This is how a username stays yours — you can only
        connect an account you own.
      </Hint>
      {body}
    </DashCard>
  );
}
