"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

/**
 * ThemeToggle — flips `data-theme` on <html> and persists the choice in a
 * cookie so the server renders the right theme on the next request. Moon on
 * light, sun on dark.
 *
 * Pass `initialTheme` from whatever already read the cookie on the server. The
 * effect below can only learn the theme *after* hydration, so without it the
 * button renders a moon on a dark page and corrects itself a beat later — a
 * visible wrong-icon flash on every single page load. The effect stays as the
 * fallback for callers that don't know the theme up front.
 */
export function ThemeToggle({
  cookieName = "theme",
  initialTheme,
}: {
  cookieName?: string;
  initialTheme?: "light" | "dark";
}) {
  const [theme, setTheme] = React.useState<string | null>(initialTheme ?? null);

  React.useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
  }, []);

  function toggle() {
    const next = (document.documentElement.dataset.theme ?? "light") === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.cookie = `${cookieName}=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
  }

  return (
    <Button
      type="button"
      variant="ghost-muted"
      size="icon-2xs"
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun aria-hidden className="size-[18px]" />
      ) : (
        <Moon aria-hidden className="size-[18px]" />
      )}
    </Button>
  );
}
