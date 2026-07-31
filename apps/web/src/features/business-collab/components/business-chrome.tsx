import { Button, cn, measure } from "@plugfolio/ui";
import { LifeBuoy, LogOut } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Logo } from "@/components/brand";

/**
 * Light business chrome (brief 11: same tokens, a touch more utilitarian).
 *
 * Not the creator dashboard's: a business has no profiles, no shelves and no
 * posts, so a section tab row would be six links to places it cannot go.
 */
export function BusinessChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div
          className={cn(
            measure({ width: "reading" }),
            "flex h-14 items-center justify-between gap-3",
          )}
        >
          <Link href="/" aria-label="Plugfolio home" className="flex items-center">
            <Logo layout="horizontal" tone="auto" />
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/support">
                <LifeBuoy className="size-4" aria-hidden="true" />
                Support
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className={cn(measure({ width: "reading" }), "pb-16")}>{children}</main>
    </div>
  );
}

/** The eyebrow + title every business screen opens with. */
export function BusinessPageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="py-8">
      <p className="tracking-eyebrow text-muted-foreground text-micro pb-1 font-mono uppercase">
        Business
      </p>
      <h1 className="font-display tracking-display text-name font-bold">{title}</h1>
      {children ? <p className="text-muted-foreground text-copy pt-1.5">{children}</p> : null}
    </header>
  );
}
