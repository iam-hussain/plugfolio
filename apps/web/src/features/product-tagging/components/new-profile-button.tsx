"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createProfile } from "../api";

/**
 * Creates a profile with a random username so the page works instantly
 * (ADR-0004); requires a connected social — the server enforces it and the
 * error is surfaced honestly.
 */
export function NewProfileButton() {
  const router = useRouter();
  const create = useMutation({ mutationFn: createProfile, onSuccess: () => router.refresh() });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
        {create.isPending ? "Creating…" : "New profile"}
      </Button>
      {create.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {create.error.message}
        </p>
      ) : null}
    </div>
  );
}
