import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

/** shadcn/ui Skeleton — a themed loading placeholder (uses the muted token). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} {...props} />;
}
