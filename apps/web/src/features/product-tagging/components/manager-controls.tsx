"use client";

import type { ManagerView } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Settings surface (ADR-0004, Admin-only): invite up to 3 Managers by email. */
export type ManagerControlsProps = {
  profileId: string;
  managers: readonly ManagerView[];
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

export function ManagerControls({ profileId, managers }: ManagerControlsProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");

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
    <div className="flex flex-col gap-3">
      {managers.length === 0 ? (
        <p className="text-muted-foreground text-sm">No Managers yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {managers.map((manager) => (
            <li key={manager.userId} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{manager.name ?? manager.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(manager.userId)}
                disabled={remove.isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim()) invite.mutate();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Manager email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="helper@example.com"
            className="border-border bg-background w-full rounded-md border p-2 text-sm"
          />
        </label>
        <Button type="submit" size="sm" disabled={invite.isPending || !email.trim()}>
          Invite
        </Button>
      </form>
      {invite.isError || remove.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {(invite.error ?? remove.error)?.message}
        </p>
      ) : null}
    </div>
  );
}
