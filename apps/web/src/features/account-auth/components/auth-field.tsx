import { cn } from "@plugfolio/ui";

/**
 * Field primitives matching the design-out auth card: Space Mono uppercase
 * micro-labels over 9px-radius inputs on the raised surface.
 */
export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-muted-foreground mb-[7px] block font-mono text-[10.5px] uppercase tracking-[0.08em]"
    >
      {children}
    </label>
  );
}

export const AUTH_INPUT =
  "bg-muted border-border focus-visible:border-ring w-full rounded-[9px] border px-3.5 py-[13px] text-sm text-foreground outline-none placeholder:text-muted-foreground/60";

export function TextField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(AUTH_INPUT, className)} {...props} />;
}
