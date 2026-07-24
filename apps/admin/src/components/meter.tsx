import { cn } from "@plugfolio/ui";

/**
 * Percentage-driven fills without inline styles: values quantize to a static
 * 5%-step class ladder the Tailwind JIT can see (§8 bans runtime-built class
 * strings AND style attributes — this is the token-safe middle).
 */
const WIDTH_STEPS = [
  "w-0", "w-[5%]", "w-[10%]", "w-[15%]", "w-[20%]", "w-[25%]", "w-[30%]", "w-[35%]",
  "w-[40%]", "w-[45%]", "w-[50%]", "w-[55%]", "w-[60%]", "w-[65%]", "w-[70%]", "w-[75%]",
  "w-[80%]", "w-[85%]", "w-[90%]", "w-[95%]", "w-full",
] as const;

const HEIGHT_STEPS = [
  "h-0.5", "h-[5%]", "h-[10%]", "h-[15%]", "h-[20%]", "h-[25%]", "h-[30%]", "h-[35%]",
  "h-[40%]", "h-[45%]", "h-[50%]", "h-[55%]", "h-[60%]", "h-[65%]", "h-[70%]", "h-[75%]",
  "h-[80%]", "h-[85%]", "h-[90%]", "h-[95%]", "h-full",
] as const;

function step(pct: number): number {
  return Math.min(20, Math.max(0, Math.round(pct / 5)));
}

/** Horizontal proportion bar (the design's tap-source rows). */
export function MeterBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div role="img" aria-label={label} className="bg-muted rounded-pill h-2 overflow-hidden">
      <div className={cn("bg-primary rounded-pill h-full", WIDTH_STEPS[step(pct)])} />
    </div>
  );
}

/** One column of the 30-day trend bar chart. */
export function TrendColumn({ pct, title }: { pct: number; title: string }) {
  return (
    <div title={title} className="flex h-full flex-1 items-end">
      <div className={cn("bg-primary/85 w-full rounded-t-[3px]", HEIGHT_STEPS[step(pct)])} />
    </div>
  );
}
