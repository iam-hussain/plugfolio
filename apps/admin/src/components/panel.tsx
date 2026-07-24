import { cn } from "@plugfolio/ui";

/** The design's card: page-surface fill, hairline border, 14px radius. */
export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-background border-border rounded-panel border", className)}
      {...props}
    />
  );
}
