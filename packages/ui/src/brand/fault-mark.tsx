import * as React from "react";
import { cn } from "../lib/cn";
import { PlugMark } from "./plug-mark";

/**
 * FaultMark — the v2 system screens' animated mark (ADR-0026 §8,
 * `Plugfolio v2.dc.html` §404/§error): the PlugMark split down the middle,
 * its halves pulling apart on a loop with a spark firing in the gap. The 404
 * runs the slow tempo ("unplugged"), the error screen the fast one with the
 * left half flickering. Reduced-motion stills the whole thing — the seam
 * alone carries the message.
 *
 * `tone="fault"` sparks in the danger coral; the default sparks in the page
 * accent. Decorative by nature — always aria-hidden; the headline beside it
 * does the talking.
 */
export function FaultMark({
  tempo = "slow",
  tone = "accent",
  className,
}: {
  /** `slow` = 404 (3.4s) · `fast` = error (2.4s). */
  tempo?: "slow" | "fast";
  tone?: "accent" | "fault";
  className?: string;
}) {
  const fast = tempo === "fast";
  const spark = cn(
    "rounded-[1px] motion-reduce:animate-none",
    tone === "fault" ? "bg-destructive" : "bg-primary",
    fast ? "animate-spark-fast" : "animate-spark",
  );
  return (
    <div aria-hidden className={cn("relative h-[78px] w-[62px]", className)}>
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1/2 overflow-hidden motion-reduce:animate-none",
          fast ? "animate-pull-l-fast" : "animate-pull-l",
        )}
      >
        <div className="flex h-[78px] w-[62px] items-center">
          <PlugMark
            tone="auto"
            size="xl"
            className={cn(
              "size-[62px] motion-reduce:animate-none",
              fast ? "animate-flick-fast" : "animate-flick",
            )}
          />
        </div>
      </div>
      <div
        className={cn(
          "absolute left-1/2 top-0 h-full w-1/2 overflow-hidden motion-reduce:animate-none",
          fast ? "animate-pull-r-fast" : "animate-pull-r",
        )}
      >
        <div className="-ml-[31px] flex h-[78px] w-[62px] items-center">
          <PlugMark tone="auto" size="xl" className="size-[62px]" />
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[5px]">
        <span className={cn(spark, "size-1")} />
        <span className={cn(spark, "size-[7px] rounded-[2px] [animation-delay:.06s]")} />
        <span className={cn(spark, "size-1 [animation-delay:.12s]")} />
      </div>
    </div>
  );
}
