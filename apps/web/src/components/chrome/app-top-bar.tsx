import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@plugfolio/ui";
import { auth } from "@/server/auth";
import { Logo } from "@/components/brand";
import { SearchIcon, UserIcon } from "./icons";

/**
 * App top bar — carried by every public shopper screen (Dev Spec §03, design-
 * out discover/creator top bar). Left: PlugMark + wordmark → home, on the
 * 1180px inner. Right on mobile: search + the account slot (the app chrome);
 * right on desktop: Explore / Log in text nav + the "Create your page" CTA,
 * or the avatar when signed in. Server Component so the slot reflects the
 * session without a client round-trip; nothing here ever walls the buy path.
 */
export async function AppTopBar() {
  const session = await auth();
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-5 lg:h-[62px] lg:px-11">
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>
        <div className="flex items-center gap-1 lg:gap-4">
          <Link
            href="/explore"
            className="text-muted-foreground hover:text-foreground hidden text-sm font-semibold lg:inline"
          >
            Explore
          </Link>
          <Button variant="ghost" size="icon-sm" asChild className="lg:hidden">
            <Link href="/explore" aria-label="Search creators">
              <SearchIcon />
            </Link>
          </Button>
          {user ? (
            <Link href="/account" aria-label="Your account" className="ml-1">
              <Avatar className="size-8">
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="bg-muted text-foreground text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-foreground hidden text-sm font-semibold lg:inline"
              >
                Log in
              </Link>
              <Link
                href="/join?as=creator"
                className="bg-primary text-primary-foreground rounded-pill hidden px-[18px] py-[9px] text-sm font-semibold lg:inline-flex"
              >
                Create your page
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
