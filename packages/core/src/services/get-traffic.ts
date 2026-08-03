import type {
  TrafficRange,
  TrafficReadRepository,
  TrafficSummary,
} from "../ports/traffic-repository";

/**
 * Traffic read use-case. Thin today: the projection lives in the repository
 * (it's an aggregation query). The creator dashboard calls this; when access
 * rules land with auth (Admin/Manager), they enforce here — pages still never
 * touch a repository.
 */
export type TrafficReadDeps = {
  traffic: TrafficReadRepository;
};

/** The ranges the Traffic screen offers, in display order. */
export const TRAFFIC_RANGES: readonly { key: TrafficRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

export function parseTrafficRange(value: string | undefined): TrafficRange {
  return TRAFFIC_RANGES.some((r) => r.key === value) ? (value as TrafficRange) : "month";
}

export async function getTraffic(
  deps: TrafficReadDeps & { now?: () => Date },
  profileId: string,
  range: TrafficRange = "all",
): Promise<TrafficSummary> {
  const now = deps.now?.() ?? new Date();
  const DAY = 86_400_000;
  const since =
    range === "today"
      ? new Date(new Date(now).setHours(0, 0, 0, 0))
      : range === "week"
        ? new Date(now.getTime() - 7 * DAY)
        : range === "month"
          ? new Date(now.getTime() - 30 * DAY)
          : range === "year"
            ? new Date(now.getFullYear(), 0, 1)
            : null;
  const bucket = range === "today" ? "hour" : range === "year" || range === "all" ? "month" : "day";
  return deps.traffic.summarize(profileId, { since, bucket, now });
}

/**
 * A referrer URL, named. Coarse on purpose: the screen promises "the link
 * that brought each view, as the browser reported it" — a hostname family,
 * never a guessed campaign. No referrer is "Typed or unknown", stated rather
 * than distributed among the others.
 */
export function classifyReferrer(referrer: string | null): string {
  if (!referrer) return "Typed or unknown";
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Typed or unknown";
  }
  if (host.includes("instagram.com")) return "Instagram";
  if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
  if (host.includes("tiktok.com")) return "TikTok";
  if (host.includes("google.")) return "Google";
  if (host.includes("whatsapp.com") || host === "wa.me") return "WhatsApp";
  if (host === "t.co" || host === "x.com" || host.includes("twitter.com")) return "X";
  if (host.includes("facebook.com") || host === "fb.me" || host === "l.facebook.com")
    return "Facebook";
  return host;
}

/**
 * Taps ÷ views, as a percentage to one decimal. The only one of the three
 * figures a creator can act on — and the reason views and taps are never shown
 * apart. No views means no rate, which is not the same claim as 0%.
 */
export function tapThroughRate(summary: {
  readonly totalViews: number;
  readonly totalTaps: number;
}): number | null {
  if (summary.totalViews <= 0) return null;
  return Math.round((summary.totalTaps / summary.totalViews) * 1000) / 10;
}
