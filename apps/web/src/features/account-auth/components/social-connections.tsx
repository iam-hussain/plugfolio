import type { YouTubeConnectionView } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { SocialGlyph } from "@/features/creator-page";
import { connectGoogle } from "../connect-social-action";

/**
 * Account-level social connections (ADR-0004): connect Google, then show the
 * YouTube channels it exposes — the pool profile usernames are picked from.
 * Server component; `youtube` is null when the OAuth app isn't configured.
 */

const subscriberFormat = new Intl.NumberFormat("en", { notation: "compact" });

export function SocialConnections({ youtube }: { youtube: YouTubeConnectionView | null }) {
  return (
    <section aria-label="Connected socials" className="pb-8">
      <h2 className="pb-1 font-medium">Connections</h2>
      <p className="text-muted-foreground pb-4 text-sm">
        Connect the socials you own — profile usernames come from their handles.
      </p>
      {youtube === null ? (
        <p className="text-muted-foreground text-sm">
          Google connect isn&apos;t configured on this server yet. Meta (Instagram) is coming next.
        </p>
      ) : youtube.connected ? (
        <YouTubeChannelList channels={youtube.channels} />
      ) : (
        <form action={connectGoogle}>
          <Button type="submit" variant="outline" size="sm">
            <SocialGlyph platform="youtube" />
            Connect Google (YouTube)
          </Button>
        </form>
      )}
    </section>
  );
}

function YouTubeChannelList({
  channels,
}: {
  channels: Extract<YouTubeConnectionView, { connected: true }>["channels"];
}) {
  if (channels.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-muted-foreground text-sm">
          Google is connected, but no channels are readable — reconnect to refresh access.
        </p>
        <form action={connectGoogle}>
          <Button type="submit" variant="outline" size="sm">
            Reconnect
          </Button>
        </form>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {channels.map((channel) => (
        <li key={channel.id} className="border-border flex items-center gap-3 rounded-md border p-3">
          {channel.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote YouTube avatar, unknown host
            <img
              src={channel.thumbnailUrl}
              alt=""
              className="size-10 rounded-pill"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-muted-foreground flex size-10 items-center justify-center">
              <SocialGlyph platform="youtube" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{channel.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {channel.handle ?? "no handle"}
              {channel.subscriberCount !== null
                ? ` · ${subscriberFormat.format(channel.subscriberCount)} subscribers`
                : null}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
