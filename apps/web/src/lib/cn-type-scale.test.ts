import { cn } from "@plugfolio/ui";
import { describe, expect, it } from "vitest";

/**
 * `cn()` must not eat a colour when a size sits next to it.
 *
 * tailwind-merge assumes any `text-…` that isn't one of Tailwind's own sizes is
 * a colour, so every step of our scale (§7) looked like one and the real colour
 * lost. It shipped: Explore's "+N" pill rendered ink-on-ink as an empty black
 * circle. The failure is invisible — no error, no type — so it needs a test.
 *
 * Lives here rather than in `@plugfolio/ui` because this is where a test runner
 * already is; adding vitest to the design system for one assertion costs more
 * than the assertion is worth.
 */
describe("cn() and the type scale", () => {
  it("keeps a colour that a font size follows", () => {
    const result = cn("bg-foreground text-background rounded-pill text-micro font-bold");
    expect(result).toContain("text-background");
    expect(result).toContain("text-micro");
  });

  it("still lets a later size beat an earlier one", () => {
    expect(cn("text-body text-micro")).toBe("text-micro");
    expect(cn("text-display-lg", "text-title")).toBe("text-title");
  });

  it("still lets a later colour beat an earlier one", () => {
    expect(cn("text-muted-foreground text-primary")).toBe("text-primary");
  });
});
