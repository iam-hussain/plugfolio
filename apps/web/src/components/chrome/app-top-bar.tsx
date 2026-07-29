import { getMemberHandle } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";
import { Logo } from "@/components/brand";
import { AccountMenu, type AccountMenuProfile } from "./account-menu";
import { SearchIcon, UserIcon } from "./icons";

/**
 * App top bar — the one shared header on every page (Dev Spec §03; §7 unified
 * chrome). Left: PlugMark + wordmark → home.
 *
 * Signed out (a prospect): the full marketing nav (Explore · How it works · For
 * creators · For business) with Log in + the "Explore creators" CTA on desktop.
 *
 * Signed in: Explore · Following, and the account menu (DESIGN chrome.js) — the
 * avatar + mode pill that opens the roles/profiles dropdown. Server Component so
 * the session and the profile list resolve without a client round-trip; nothing
 * here ever walls the buy path.
 */
const MARKETING_NAV: readonly { label: string; href: Route }[] = [
  { label: "Explore", href: "/explore" as Route },
  { label: "How it works", href: "/how-it-works" as Route },
  { label: "For creators", href: "/for-creators" as Route },
  { label: "For business", href: "/for-business" as Route },
];

const SIGNED_IN_NAV: readonly { label: string; href: Route }[] = [
  { label: "Explore", href: "/explore" as Route },
  { label: "Following", href: "/following" as Route },
];

export async function AppTopBar() {
  const session = await auth();
  const user = session?.user;

  // Signed-in: gather the account menu's data (handle, roles, business).
  const menu = user
    ? await (async () => {
        const [handle, accessible, business] = await Promise.all([
          getMemberHandle({ users: repositories.users }, user.id),
          repositories.profiles.listAccessibleByUser(user.id),
          repositories.businesses.findByUser(user.id),
        ]);
        const profiles: AccountMenuProfile[] = accessible.map((profile) => ({
          username: profile.username,
          role: profile.role === "admin" ? "Dashboard" : "Manager",
        }));
        const resolvedHandle = handle ?? user.email?.split("@")[0] ?? "you";
        return {
          name: user.name ?? `@${resolvedHandle}`,
          handle: resolvedHandle,
          email: user.email ?? "",
          avatarUrl: user.image ?? null,
          profiles,
          hasBusiness: business !== null,
        };
      })()
    : null;

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between gap-4 px-5 lg:h-[62px] lg:px-11">
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {(user ? SIGNED_IN_NAV : MARKETING_NAV).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-3">
          {menu ? (
            <>
              <Button variant="ghost" size="icon-sm" asChild className="lg:hidden">
                <Link href="/explore" aria-label="Search creators">
                  <SearchIcon />
                </Link>
              </Button>
              <AccountMenu {...menu} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" asChild className="lg:hidden">
                <Link href="/explore" aria-label="Search creators">
                  <SearchIcon />
                </Link>
              </Button>
              <Link
                href="/signin"
                className="text-foreground hidden text-sm font-semibold lg:inline"
              >
                Log in
              </Link>
              <Link
                href="/explore"
                className="bg-primary text-primary-foreground rounded-pill hidden px-[18px] py-[9px] text-sm font-semibold lg:inline-flex"
              >
                Explore creators
              </Link>
              <Button variant="ghost" size="icon-sm" asChild className="lg:hidden">
                <Link href="/signin" aria-label="Sign in">
                  <UserIcon />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
