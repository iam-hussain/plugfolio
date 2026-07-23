"use client";

import type { ManagerView } from "@plugfolio/core";
import { Avatar, AvatarFallback, Button, Input } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Settings surface (ADR-0004, Admin-only): invite up to 3 Managers by email. */
export type ManagerControlsProps = {
  profileId: string;
  managers: readonly ManagerView[];
  /** MAX_MANAGERS_PER_PROFILE, passed from the server — core stays out of the client bundle. */
  maxManagers: number;
};

async function send(path: string, method: string, body?: unknown): Promise<void> {
  const response = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Request failed");
  }
}

export function ManagerControls({ profileId, managers, maxManagers }: ManagerControlsProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const atCap = managers.length >= maxManagers;

  const invite = useMutation({
    mutationFn: () => send(`/api/profiles/${profileId}/managers`, "POST", { email }),
    onSuccess: () => {
      setEmail("");
      router.refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (managerUserId: string) =>
      send(`/api/profiles/${profileId}/managers/${managerUserId}`, "DELETE"),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-4">
      {managers.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No Managers yet — invite up to {maxManagers} people to help post.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {managers.map((manager) => {
            const display = manager.name ?? manager.email;
            return (
              <li key={manager.userId} className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-muted text-foreground text-xs">
                    {display.trim().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm">{display}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${display}`}
                  onClick={() => {
                    // Removal is immediate — they lose access on their next request.
                    if (window.confirm(`Remove ${display}? They lose access immediately.`)) {
                      remove.mutate(manager.userId);
                    }
                  }}
                  disabled={remove.isPending}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) invite.mutate();
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Manager email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="helper@example.com"
            disabled={atCap}
          />
        </label>
        <Button type="submit" size="sm" disabled={invite.isPending || atCap || !email.trim()}>
          {invite.isPending ? "Inviting…" : "Invite"}
        </Button>
      </form>
      {atCap ? (
        <p className="text-muted-foreground text-xs">
          This profile has all {maxManagers} Managers — remove one to invite another.
        </p>
      ) : null}
      {invite.isError || remove.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {(invite.error ?? remove.error)?.message}
        </p>
      ) : null}
    </div>
  );
}
