import { getMemberHandle } from "@plugfolio/core";
import { cn, measure, ThemeToggle } from "@plugfolio/ui";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "@/server/auth";
import { repositories } from "@/server/container";
import { Logo } from "@/components/brand";
import { AccountMenu, type AccountMenuProfile } from "./account-menu";
import { SearchIcon, UserIcon } from "./icons";
import { PAGE_CONTEXT_SLOT } from "./page-context-slot";

/**
 * App top bar (v2, ADR-0026) — the one shared header on every page. Left: the
 * brand lockup. Right: the search circle, the theme toggle, and either the
 * sign-in pill or the account pill (avatar + @handle) that opens the account
 * menu. Navigation itself lives in the morphing pill nav and the footer — the
 * bar carries identity and entry points, not a link row.
 *
 * Server Component so the session and the profile list resolve without a
 * client round-trip; nothing here ever walls the buy path.
 */
export async function AppTopBar() {
  const session = await auth();
  const user = session?.user;
  // The same cookie `RootLayout` puts on <html>; read again here rather than
  // threaded through, because every route already renders this bar.
  const theme = (await cookies()).get("theme")?.value === "dark" ? "dark" : "light";

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
          name: user.name ?? null,
          handle: resolvedHandle,
          email: user.email ?? "",
          avatarUrl: user.image ?? null,
          profiles,
          hasBusiness: business !== null,
        };
      })()
    : null;

  return (
    <header className="border-border bg-veil sticky top-0 z-40 border-b backdrop-blur-[14px]">
      <div className={cn(measure(), "flex h-[60px] items-center gap-3.5")}>
        {/* Signed in, the logo goes to Explore (their real home); signed out it
            goes to the marketing landing. */}
        <Link
          href={user ? "/explore" : "/"}
          aria-label={user ? "Explore creators" : "Plugfolio home"}
          className="flex shrink-0 items-center"
        >
          <Logo layout="horizontal" tone="auto" />
        </Link>

        {/* A page may own ONE element inside the shared bar: /[handle] puts the
            creator's identity here once their header scrolls out of view.
            `flex-1` keeps the right-side cluster hard right either way. */}
        <div id={PAGE_CONTEXT_SLOT} className="flex min-w-0 flex-1 items-center" />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/explore"
            aria-label="Search creators, posts and things"
            title="Search creators, posts and things"
            className="bg-active border-border text-muted-foreground hover:text-foreground rounded-pill flex size-9 items-center justify-center border transition-colors"
          >
            <SearchIcon className="size-4" />
          </Link>
          {/* The theme is a device preference, not an account setting, so it
              sits outside the account menu and needs no session. Seeded from
              the cookie so the icon is right on the first paint. */}
          <ThemeToggle initialTheme={theme} />
          {menu ? (
            <AccountMenu {...menu} />
          ) : (
            <Link
              href="/signin"
              className="border-border-strong text-label rounded-pill flex h-9 items-center gap-[7px] border px-[15px] font-semibold"
            >
              <UserIcon className="size-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
