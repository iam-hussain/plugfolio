"use client";

import { Avatar, AvatarFallback, AvatarImage, cn } from "@plugfolio/ui";
import type { Route } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The signed-in account menu (v2, ADR-0026 / `Plugfolio v2.dc.html`
 * §accountMenu). The pill carries the account's own **@handle**; the menu
 * opens on that identity over a mono role line, then — for a creator — the
 * SWITCH PROFILE rows (avatar, name, /username, the EDITING mark on the one
 * the dashboard currently has open), then the flat item list ending in the
 * coral Log out. A hat the account doesn't hold is absent, never greyed —
 * and never an invitation: becoming a business is a request through Support.
 */
export type AccountMenuProfile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "admin" | "manager";
};

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
  "hover:bg-active text-foreground rounded-panel flex min-h-11 w-full items-center px-2.5 py-2.5 text-left text-label font-medium no-underline transition-colors";
const sectionClass =
  "text-faint tracking-eyebrow px-2 pb-1.5 pt-0.5 font-mono text-pico font-bold uppercase";

export function AccountMenu({ name, handle, avatarUrl, profiles, hasBusiness }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "/";
  const params = useSearchParams();

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

  // The handle first, and strip a leading "@" so the fallback is a letter.
  const initial = (handle || name || "?").trim().replace(/^@/, "").charAt(0).toUpperCase() || "?";

  // The EDITING mark: only knowable inside the dashboard, where ?profile=
  // names the open profile (the switcher's own rule — first profile otherwise).
  const editingId = pathname.startsWith("/dashboard")
    ? (params.get("profile") ?? profiles[0]?.id ?? null)
    : null;

  const adminCount = profiles.filter((profile) => profile.role === "admin").length;
  const roleLine =
    profiles.length > 0
      ? adminCount > 0
        ? `Creator · Admin of ${adminCount} profile${adminCount === 1 ? "" : "s"}`
        : "Creator · Manager"
      : hasBusiness
        ? "Business account"
        : "Shopper";

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
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
          {/* ── who is signed in ── */}
          <div className="flex items-center gap-2.5 px-2 pb-2.5 pt-1.5">
            <Avatar className="size-9">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-active text-foreground text-micro">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-copy truncate font-semibold">@{handle}</p>
              <p className="text-faint tracking-eyebrow text-pico mt-0.5 truncate font-mono uppercase">
                {roleLine}
              </p>
            </div>
          </div>

          {/* ── switch profile ── */}
          {profiles.length > 0 ? (
            <div className="border-border border-t pt-2">
              <p className={sectionClass}>Switch profile</p>
              {profiles.map((profile) => {
                const editing = profile.id === editingId;
                return (
                  <Link
                    key={profile.id}
                    role="menuitem"
                    href={`/dashboard?profile=${profile.id}` as Route}
                    onClick={close}
                    className={cn(
                      "rounded-panel flex min-h-11 items-center gap-2.5 px-2 py-2 no-underline transition-colors",
                      editing ? "bg-active" : "hover:bg-active",
                    )}
                  >
                    <Avatar className="rounded-[9px] size-7">
                      {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
                      <AvatarFallback className="bg-background text-primary text-pico rounded-[9px] font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="text-label block truncate font-semibold">
                        {profile.displayName ?? `@${profile.username}`}
                      </span>
                      <span className="text-faint text-pico block truncate font-mono tracking-[0.06em]">
                        /{profile.username}
                      </span>
                    </span>
                    {editing ? (
                      <span className="text-primary tracking-eyebrow text-pico font-mono font-bold uppercase">
                        Editing
                      </span>
                    ) : profile.role === "manager" ? (
                      <span className="text-faint tracking-eyebrow text-pico font-mono uppercase">
                        Manager
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* ── the item list ── */}
          <div className="border-border mt-2 flex flex-col gap-px border-t pt-2">
            {profiles.length > 0 ? (
              <Link role="menuitem" href="/dashboard" onClick={close} className={itemClass}>
                Dashboard
              </Link>
            ) : null}
            {adminCount > 0 && adminCount < 5 ? (
              <Link role="menuitem" href="/dashboard" onClick={close} className={itemClass}>
                New profile
              </Link>
            ) : null}
            {hasBusiness ? (
              <Link role="menuitem" href="/collabs" onClick={close} className={itemClass}>
                Collabs
              </Link>
            ) : null}
            <Link role="menuitem" href="/saved" onClick={close} className={itemClass}>
              Saved
            </Link>
            <Link role="menuitem" href="/following" onClick={close} className={itemClass}>
              Following
            </Link>
            <Link role="menuitem" href="/account" onClick={close} className={itemClass}>
              Account
            </Link>
            <Link role="menuitem" href="/support" onClick={close} className={itemClass}>
              Support &amp; feedback
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${itemClass} text-destructive font-semibold`}
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
