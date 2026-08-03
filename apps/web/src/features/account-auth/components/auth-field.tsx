import { cn } from "@plugfolio/ui";

/**
 * Field primitives matching the v2 auth card (ADR-0026): Space Mono uppercase
 * micro-labels over 14px-radius inputs on the sunk fill.
 */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-faint text-pico tracking-eyebrow mb-1.5 block font-mono uppercase"
    >
      {children}
    </label>
  );
}

export const AUTH_INPUT =
  "bg-active border-border focus-visible:border-ring rounded-panel h-12 w-full border px-[13px] text-copy text-foreground outline-none placeholder:text-faint";

export function TextField({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(AUTH_INPUT, className)} {...props} />;
}
