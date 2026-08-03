"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@plugfolio/ui";
import type { Route } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * The signed-in account menu (DESIGN chrome.js §acctmenu). The pill carries the
 * account's own **handle** — "Shopping" named a mode nobody had chosen, on a
 * bar where the one thing a person wants confirmed is *who they are signed in
 * as*. The dropdown opens on that same identity (handle · Shopper · name ·
 * email) and then lists only the hats the account actually holds: each creator
 * profile with its role (Dashboard = owner, Manager = invited helper), and a
 * business if there is one. A hat it doesn't hold is absent, never greyed —
 * and never an invitation: becoming a business is a request through Support,
 * not a menu item that quietly creates one.
 */
export type AccountMenuProfile = { username: string; role: "Dashboard" | "Manager" };

export type AccountMenuProps = {
  /** Null when the account has never set one — the handle carries the header. */
  name: string | null;
  handle: string;
  email: string;
  avatarUrl: string | null;
  profiles: readonly AccountMenuProfile[];
  hasBusiness: boolean;
};

const itemClass =
  "hover:bg-active text-foreground rounded-panel flex min-h-11 w-full items-center gap-2.5 px-2.5 py-2.5 text-left text-label font-medium no-underline transition-colors";
const sectionClass =
  "text-faint tracking-eyebrow mx-2 mt-2.5 mb-1.5 font-mono text-pico font-bold uppercase";
const subClass = "text-faint ml-auto text-micro font-semibold";

export function AccountMenu({
  name,
  handle,
  email,
  avatarUrl,
  profiles,
  hasBusiness,
}: AccountMenuProps) {
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
  const initial = (handle || name || "?").trim().replace(/^@/, "").charAt(0).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        // Symmetric padding by default, and the extra right padding only from
        // `sm` — which is exactly where the "Shopping ▾" label appears. Below
        // that the label is hidden but `pr-3` stayed, so the pill rendered
        // 52×46: a visibly squashed egg around a perfectly round avatar.
        className="border-border-strong rounded-pill flex h-9 items-center gap-2 border p-[3px] transition-transform hover:-translate-y-px sm:pr-3"
      >
        <Avatar className="size-7">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-active text-foreground text-micro">{initial}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[14ch] items-center gap-1.5 sm:inline-flex">
          <span className="text-foreground text-nano truncate font-mono tracking-[0.04em]">
            @{handle}
          </span>
          <span aria-hidden className="text-primary text-nano">
            {open ? "▴" : "▾"}
          </span>
        </span>
        <span className="sr-only">Your account and roles</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border-strong bg-card shadow-pop rounded-tile absolute right-0 top-[calc(100%+10px)] z-[70] w-[min(282px,calc(100vw-32px))] border p-2.5"
        >
          <div className="border-border mb-1.5 border-b px-3 pb-3 pt-2.5">
            <div className="flex items-center gap-2">
              <b className="text-foreground text-copy truncate font-bold">@{handle}</b>
              {/* Every account shops — it is the one hat that is never absent
                  (§2.2), so it reads as a tag on the identity, not a mode. */}
              <span className="bg-active text-brand-violet-deep rounded-pill text-nano ml-auto shrink-0 px-2 py-0.5 font-bold uppercase tracking-[0.06em]">
                Shopper
              </span>
            </div>
            {name ? (
              <span className="text-foreground text-micro mt-1 block truncate">{name}</span>
            ) : null}
            <span className="text-muted-foreground text-micro block truncate">{email}</span>
          </div>

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
                  <span className="bg-muted text-foreground rounded-pill text-pico grid size-[22px] shrink-0 place-items-center font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                  @{profile.username}
                  <span className={subClass}>{profile.role}</span>
                </Link>
              ))}
            </>
          ) : null}

          {/* Only when something sat between it and the header — otherwise
              this and the header's own rule stack into a double line. */}
          {profiles.length > 0 ? <hr className="border-border my-1.5" /> : null}

          {/* Only when it exists. There is deliberately no "create one" twin:
              a business account is asked for through Support (category
              `business_account`), so an operator sees who is hiring. */}
          {hasBusiness ? (
            <Link
              role="menuitem"
              href="/collabs"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <span className="bg-tile-mint rounded-pill size-2.5 shrink-0" aria-hidden />
              Your business
            </Link>
          ) : null}
          <Link
            role="menuitem"
            href="/account"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            Account settings
          </Link>
          <Link
            role="menuitem"
            href="/support"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            Help
          </Link>

          <hr className="border-border my-1.5" />

          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`${itemClass} text-destructive font-semibold`}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
