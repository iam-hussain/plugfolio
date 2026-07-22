import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@plugfolio/ui";
import { auth } from "@/server/auth";
import { Logo } from "@/components/brand";
import { SearchIcon, UserIcon } from "./icons";

/**
 * App top bar — carried by every public shopper screen (Dev Spec §03).
 * Left: PlugMark + `plugfolio` wordmark → feed. Right: search + the account
 * slot, which signals role: anonymous = user glyph → sign-in; signed-in =
 * their avatar → account. Server Component so the slot reflects the session
 * without a client round-trip; nothing here ever walls the buy path (§2.2).
 */
export async function AppTopBar() {
  const session = await auth();
  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" />
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
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
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/signin" aria-label="Sign in">
                <UserIcon />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
