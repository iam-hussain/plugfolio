"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

/**
 * ThemeToggle — flips `data-theme` on <html> and persists the choice in a
 * cookie so the server renders the right theme on the next request. The
 * Admin-design top-bar control: moon on light, sun on dark.
 */
export function ThemeToggle({ cookieName = "theme" }: { cookieName?: string }) {
  const [theme, setTheme] = React.useState<string | null>(null);

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
