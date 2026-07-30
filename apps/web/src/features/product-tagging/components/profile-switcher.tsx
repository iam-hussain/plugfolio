"use client";

import type { AccessibleProfile } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Plus } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createProfile } from "../api";

/**
 * The `[Profile ▾]` switcher every dashboard brief starts with. Switching
 * stays on the current tab; detail routes (a post editor) fall back to home
 * because their content belongs to the previous profile.
 */
const TAB_PATHS = new Set([
  "/dashboard",
  "/dashboard/posts",
  "/dashboard/products",
  "/dashboard/categories",
  "/dashboard/collabs",
]);

export type ProfileSwitcherProps = {
  profiles: readonly AccessibleProfile[];
  active?: AccessibleProfile;
  /** MAX_PROFILES_PER_ACCOUNT, passed from the server — core stays out of the client bundle. */
  maxProfiles: number;
};

export function ProfileSwitcher({
  profiles,
  active: activeProp,
  maxProfiles,
}: ProfileSwitcherProps) {
  /* The active profile comes from ?profile=, and a Next layout never
     receives searchParams — so the switcher resolves it here rather than
     forcing the shell back down into every page just to pass it in. The
     rule mirrors pickActiveProfile exactly: the requested profile if it is
     one of yours, otherwise the first. If the two ever disagree, the
     switcher would name a different profile than the page is showing. */
  const params = useSearchParams();
  const requested = params.get("profile") ?? undefined;
  const active = activeProp ?? profiles.find((p) => p.id === requested) ?? profiles[0];

  const router = useRouter();
  const pathname = usePathname();
  const create = useMutation({ mutationFn: createProfile, onSuccess: () => router.refresh() });

  if (profiles.length === 0) return null;
  const atCap = profiles.filter((profile) => profile.role === "admin").length >= maxProfiles;

  return (
    <div className="flex flex-none flex-col items-end">
      <DropdownMenu>
        {/* The design's `.psw-btn`: avatar, handle, caret. Which profile you
            are editing has to be legible at a glance and switchable without
            leaving the tab you are on, so it sits in the shell. */}
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-border bg-card text-foreground text-label rounded-pill hover:border-primary inline-flex min-h-[44px] flex-none items-center gap-2.5 border py-[7px] pl-2 pr-3.5 font-bold"
          >
            <Avatar className="size-[30px]">
              <AvatarFallback className="bg-active text-primary text-xs font-bold">
                {active?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            @{active?.username}
            <ChevronDown className="text-faint size-3.5" aria-hidden />
            <span className="sr-only">Switch profile</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[min(300px,calc(100vw-32px))]">
          <DropdownMenuLabel className="text-faint text-micro font-bold uppercase tracking-[0.08em]">
            Profiles · {profiles.length} of {maxProfiles}
          </DropdownMenuLabel>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              aria-current={profile.id === active?.id ? "true" : undefined}
              className="aria-[current]:bg-active"
              onSelect={() => {
                const base = TAB_PATHS.has(pathname) ? pathname : "/dashboard";
                router.push(`${base}?profile=${profile.id}` as Route);
              }}
            >
              <Avatar className="size-[26px]">
                <AvatarFallback className="bg-active text-primary text-[10px] font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate font-semibold">@{profile.username}</span>
              <span className="text-faint text-micro font-bold">
                {profile.id === active?.id
                  ? "Active"
                  : profile.role === "manager"
                    ? "Manager"
                    : null}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={atCap || create.isPending}
            onSelect={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <Plus className="size-4" />
            {create.isPending ? "Creating…" : atCap ? "Profile limit reached" : "New profile"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {create.isError ? (
        <p role="alert" className="text-destructive pt-1 text-xs">
          {create.error.message}
        </p>
      ) : null}
    </div>
  );
}
