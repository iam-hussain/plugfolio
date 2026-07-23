/** Compact count for stats — 1.2K / 3.4M style, per the design's mono meta. */
export function formatCount(count: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    count,
  );
}
