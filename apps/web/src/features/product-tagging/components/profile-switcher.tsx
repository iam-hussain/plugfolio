"use client";

import type { AccessibleProfile } from "@plugfolio/core";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, Plus } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
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

export function ProfileSwitcher({ profiles, active, maxProfiles }: ProfileSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const create = useMutation({ mutationFn: createProfile, onSuccess: () => router.refresh() });

  if (profiles.length === 0) return null;
  const atCap = profiles.filter((profile) => profile.role === "admin").length >= maxProfiles;

  return (
    <div className="flex flex-col items-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            @{active?.username}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Profiles · {profiles.length} of {maxProfiles}</DropdownMenuLabel>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onSelect={() => {
                const base = TAB_PATHS.has(pathname) ? pathname : "/dashboard";
                router.push(`${base}?profile=${profile.id}` as Route);
              }}
            >
              <span className="min-w-0 flex-1 truncate">
                @{profile.username}
                {profile.role === "manager" ? (
                  <span className="text-muted-foreground"> · manager</span>
                ) : null}
              </span>
              {profile.id === active?.id ? <Check className="size-4" /> : null}
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
