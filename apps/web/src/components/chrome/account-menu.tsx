"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@plugfolio/ui";
import type { Route } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * The signed-in account menu (DESIGN chrome.js §acctmenu): the avatar + mode
 * pill in the top bar opens a dropdown that names the account, then lists the
 * hats it actually holds — the shopping context, each creator profile with its
 * role (Dashboard = owner, Manager = invited helper), the business door, and
 * the way out. A hat the account doesn't hold is absent, never greyed.
 */
export type AccountMenuProfile = { username: string; role: "Dashboard" | "Manager" };

export type AccountMenuProps = {
  name: string;
  handle: string;
  email: string;
  avatarUrl: string | null;
  profiles: readonly AccountMenuProfile[];
  hasBusiness: boolean;
};

const itemClass =
  "hover:bg-active hover:text-brand-violet-deep text-foreground rounded-image flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left text-copy font-semibold no-underline transition-colors";
const sectionClass =
  "text-muted-foreground mx-3 mt-2.5 mb-1 text-nano font-bold tracking-[0.08em] uppercase";
const subClass = "text-faint ml-auto text-micro font-semibold";

export function AccountMenu({ name, handle, email, avatarUrl, profiles, hasBusiness }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The handle first, and strip a leading "@" so the fallback is a letter
  // (a name of "@maya" would otherwise stamp "@" on the avatar).
  const initial =
    (handle || name || "?")
      .trim()
      .replace(/^@/, "")
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="bg-active text-brand-violet-deep hover:border-brand-violet-deep/40 rounded-pill flex min-h-11 items-center gap-2 border border-transparent py-1.5 pr-3 pl-1.5 text-copy font-bold"
      >
        <Avatar className="size-8">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-card text-brand-violet-deep text-micro">{initial}</AvatarFallback>
        </Avatar>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="bg-primary size-2 shrink-0 rounded-pill" aria-hidden />
          Shopping
          <span aria-hidden className="text-pico">
            ▾
          </span>
        </span>
        <span className="sr-only">Your account and roles</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-card shadow-lift rounded-tile absolute top-[calc(100%+8px)] right-0 z-50 w-[min(300px,calc(100vw-32px))] border p-2"
        >
          <div className="border-border mb-1.5 border-b px-3 pt-2.5 pb-3">
            <b className="text-foreground block text-copy font-bold">{name}</b>
            <span className="text-muted-foreground mt-0.5 block text-micro">
              @{handle} · {email}
            </span>
          </div>

          <p className={sectionClass}>You are here</p>
          <Link role="menuitem" href="/following" className={itemClass} onClick={() => setOpen(false)}>
            <span className="bg-primary size-2.5 shrink-0 rounded-pill" aria-hidden />
            Shopping
            <span className={subClass}>Following</span>
          </Link>

          {profiles.length > 0 ? (
            <>
              <p className={sectionClass}>Creator · {profiles.length} of 5 profiles</p>
              {profiles.map((profile) => (
                <Link
                  key={profile.username}
                  role="menuitem"
                  href={`/dashboard?profile=${profile.username}` as Route}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  <span className="bg-muted text-foreground grid size-[22px] shrink-0 place-items-center rounded-pill text-pico font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                  @{profile.username}
                  <span className={subClass}>{profile.role}</span>
                </Link>
              ))}
            </>
          ) : null}

          <hr className="border-border my-1.5" />

          {hasBusiness ? (
            <Link role="menuitem" href="/collabs" className={itemClass} onClick={() => setOpen(false)}>
              <span className="bg-tile-mint size-2.5 shrink-0 rounded-pill" aria-hidden />
              Your business
            </Link>
          ) : (
            <Link
              role="menuitem"
              href={"/join?as=business" as Route}
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <span className="bg-tile-mint size-2.5 shrink-0 rounded-pill" aria-hidden />
              Create a business
            </Link>
          )}
          <Link role="menuitem" href="/account" className={itemClass} onClick={() => setOpen(false)}>
            Account settings
          </Link>
          <Link role="menuitem" href="/support" className={itemClass} onClick={() => setOpen(false)}>
            Help
          </Link>

          <hr className="border-border my-1.5" />

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={itemClass}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
