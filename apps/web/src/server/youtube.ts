import type { YouTubeChannel, YouTubeGateway } from "@plugfolio/core";
import { env } from "@/env";

/**
 * YouTube Data API v3 gateway (ADR-0004: read the channels behind the Google
 * connection). Lives at the server seam because token refresh needs the OAuth
 * client credentials from env.
 */

type ChannelsResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
      thumbnails?: { default?: { url?: string } };
    };
    statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
  }>;
};

export function createYouTubeGateway(): YouTubeGateway {
  return {
    async listChannels(accessToken: string): Promise<YouTubeChannel[]> {
      const url = new URL("https://www.googleapis.com/youtube/v3/channels");
      url.searchParams.set("part", "snippet,statistics");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");

      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) {
        throw new Error(`YouTube channels request failed (${res.status})`);
      }
      const body = (await res.json()) as ChannelsResponse;
      return (body.items ?? []).map((item) => ({
        id: item.id,
        title: item.snippet?.title ?? "Untitled channel",
        handle: item.snippet?.customUrl ?? null,
        thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? null,
        subscriberCount:
          item.statistics?.subscriberCount && !item.statistics.hiddenSubscriberCount
            ? Number(item.statistics.subscriberCount)
            : null,
      }));
    },

    async refreshAccessToken(refreshToken: string) {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
      // Rejection means access was revoked — the service degrades to re-auth.
      if (!res.ok) return null;
      const body = (await res.json()) as { access_token: string; expires_in: number };
      return {
        accessToken: body.access_token,
        expiresAt: new Date(Date.now() + body.expires_in * 1000),
      };
    },
  };
}
