/**
 * Ports for reading the socials an account has connected (ADR-0004). The
 * Auth.js Account row IS the connection (ADR-0007) — these ports expose its
 * OAuth tokens to services and let a refreshed access token be persisted.
 */

export type SocialProvider = "google" | "facebook";

export type SocialTokens = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly expiresAt: Date | null;
};

export type SocialConnectionRepository = {
  /** Null when the provider was never connected to this account. */
  getTokens(userId: string, provider: SocialProvider): Promise<SocialTokens | null>;
  /**
   * Persist fresh tokens — after a refresh, or on re-consent (Auth.js never
   * updates an existing Account row itself). Omitted refreshToken keeps the
   * stored one.
   */
  updateTokens(
    userId: string,
    provider: SocialProvider,
    tokens: { accessToken: string; refreshToken?: string; expiresAt: Date | null },
  ): Promise<void>;
};

/** A channel the connected Google account owns — the ADR-0004 handle source. */
export type YouTubeChannel = {
  readonly id: string;
  readonly title: string;
  /** The channel `@handle` (snippet.customUrl); null for handle-less channels. */
  readonly handle: string | null;
  readonly thumbnailUrl: string | null;
  /** Null when the channel hides its subscriber count. */
  readonly subscriberCount: number | null;
};

export type YouTubeGateway = {
  listChannels(accessToken: string): Promise<YouTubeChannel[]>;
  /** Null when Google rejects the refresh (revoked access). */
  refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date } | null>;
};
