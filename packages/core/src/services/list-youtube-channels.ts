import type {
  SocialConnectionRepository,
  YouTubeChannel,
  YouTubeGateway,
} from "../ports/social-connection-repository";

/**
 * List the YouTube channels behind the account's Google connection
 * (ADR-0004: these are the handles a profile username may be picked from).
 * Refreshes a stale access token before calling YouTube, and persists the
 * fresh one so the next read skips the round-trip.
 */

export type ListYouTubeChannelsDeps = {
  connections: SocialConnectionRepository;
  youtube: YouTubeGateway;
  now: () => Date;
};

export type YouTubeConnectionView =
  | { connected: false }
  | { connected: true; channels: YouTubeChannel[] };

// Refresh a minute early so a token never expires mid-request.
const EXPIRY_SKEW_MS = 60_000;

export async function listYouTubeChannels(
  deps: ListYouTubeChannelsDeps,
  userId: string,
): Promise<YouTubeConnectionView> {
  const tokens = await deps.connections.getTokens(userId, "google");
  if (!tokens) return { connected: false };

  let accessToken = tokens.accessToken;
  const stale =
    !accessToken ||
    !tokens.expiresAt ||
    tokens.expiresAt.getTime() < deps.now().getTime() + EXPIRY_SKEW_MS;

  if (stale) {
    const refreshed = tokens.refreshToken
      ? await deps.youtube.refreshAccessToken(tokens.refreshToken)
      : null;
    if (!refreshed) {
      // Connected but unusable (revoked, or a pre-offline-consent token with
      // no refresh_token). Surface "connected, re-auth to see channels"
      // rather than crashing the dashboard on a guaranteed 401.
      return { connected: true, channels: [] };
    }
    accessToken = refreshed.accessToken;
    await deps.connections.updateTokens(userId, "google", {
      accessToken: refreshed.accessToken,
      expiresAt: refreshed.expiresAt,
    });
  }

  try {
    return { connected: true, channels: await deps.youtube.listChannels(accessToken!) };
  } catch {
    // A live token can still be rejected (scope not granted at consent, API
    // not enabled). Same honest degrade as above: connected, re-auth to fix.
    return { connected: true, channels: [] };
  }
}
