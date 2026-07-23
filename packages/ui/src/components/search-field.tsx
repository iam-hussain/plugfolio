import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * SearchField — the Admin-design search input: leading search glyph inside a
 * strong-hairline field, 13.5px text. A plain input for GET forms.
 */
export type SearchFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="text-faint pointer-events-none absolute left-[11px] top-1/2 size-4 -translate-y-1/2"
      />
      <input
        type="search"
        {...props}
        className={cn(
          "border-border-strong bg-background text-foreground placeholder:text-faint w-full rounded-lg border py-[9px] pl-[34px] pr-3 text-[13.5px] outline-none",
          "focus:border-primary",
        )}
      />
    </div>
  );
}
