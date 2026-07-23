import { describe, expect, it, vi } from "vitest";
import type {
  SocialConnectionRepository,
  SocialTokens,
  YouTubeGateway,
} from "../ports/social-connection-repository";
import { listYouTubeChannels } from "./list-youtube-channels";

const NOW = new Date("2026-07-23T12:00:00Z");
const CHANNEL = {
  id: "UC123",
  title: "My Channel",
  handle: "@mychannel",
  thumbnailUrl: null,
  subscriberCount: 42,
};

function makeDeps(tokens: SocialTokens | null) {
  const connections: SocialConnectionRepository = {
    getTokens: vi.fn().mockResolvedValue(tokens),
    updateTokens: vi.fn().mockResolvedValue(undefined),
  };
  const youtube: YouTubeGateway = {
    listChannels: vi.fn().mockResolvedValue([CHANNEL]),
    refreshAccessToken: vi
      .fn()
      .mockResolvedValue({ accessToken: "fresh", expiresAt: new Date(NOW.getTime() + 3_600_000) }),
  };
  return { connections, youtube, now: () => NOW };
}

describe("listYouTubeChannels", () => {
  it("reports not connected when no google Account row exists", async () => {
    const deps = makeDeps(null);
    expect(await listYouTubeChannels(deps, "u1")).toEqual({ connected: false });
  });

  it("uses the stored token while it is still fresh", async () => {
    const deps = makeDeps({
      accessToken: "stored",
      refreshToken: "r",
      expiresAt: new Date(NOW.getTime() + 3_600_000),
    });
    const result = await listYouTubeChannels(deps, "u1");
    expect(result).toEqual({ connected: true, channels: [CHANNEL] });
    expect(deps.youtube.listChannels).toHaveBeenCalledWith("stored");
    expect(deps.youtube.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("refreshes and persists when the token is stale", async () => {
    const deps = makeDeps({
      accessToken: "stale",
      refreshToken: "r",
      expiresAt: new Date(NOW.getTime() - 1),
    });
    const result = await listYouTubeChannels(deps, "u1");
    expect(result).toEqual({ connected: true, channels: [CHANNEL] });
    expect(deps.youtube.listChannels).toHaveBeenCalledWith("fresh");
    expect(deps.connections.updateTokens).toHaveBeenCalledWith("u1", "google", {
      accessToken: "fresh",
      expiresAt: new Date(NOW.getTime() + 3_600_000),
    });
  });

  it("degrades to an empty channel list when YouTube rejects the token", async () => {
    const deps = makeDeps({
      accessToken: "live-but-scopeless",
      refreshToken: "r",
      expiresAt: new Date(NOW.getTime() + 3_600_000),
    });
    deps.youtube.listChannels = vi.fn().mockRejectedValue(new Error("403"));
    expect(await listYouTubeChannels(deps, "u1")).toEqual({ connected: true, channels: [] });
  });

  it("degrades to an empty channel list when refresh is impossible", async () => {
    const deps = makeDeps({ accessToken: "stale", refreshToken: null, expiresAt: null });
    const result = await listYouTubeChannels(deps, "u1");
    expect(result).toEqual({ connected: true, channels: [] });
    expect(deps.youtube.listChannels).not.toHaveBeenCalled();
  });
});
