import * as React from "react";
import { Heart, House, LayoutGrid, Search, User } from "lucide-react";
import { cn } from "@plugfolio/ui";

/**
 * The persistent shopper chrome's icons (Dev Spec §03: "20px line icons —
 * home / 2×2 grid / heart / user"), served by lucide-react (§8 icon rule).
 * These wrappers pin the spec's size + stroke so call sites stay clean; color
 * inherits via currentColor.
 */
type IconProps = { className?: string };

function chrome(Glyph: React.ComponentType<React.SVGProps<SVGSVGElement>>) {
  return function ChromeIcon({ className }: IconProps) {
    return <Glyph aria-hidden strokeWidth={1.75} className={cn("h-5 w-5", className)} />;
  };
}

export const HomeIcon = chrome(House);
export const GridIcon = chrome(LayoutGrid);
export const HeartIcon = chrome(Heart);
export const UserIcon = chrome(User);
export const SearchIcon = chrome(Search);
