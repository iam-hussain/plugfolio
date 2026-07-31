"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { closeRequirement } from "../api";

/** Close a requirement (brief 11): off the open board; threads persist. */
export function CloseRequirementButton({ requirementId }: { requirementId: string }) {
  const router = useRouter();
  const close = useMutation({
    mutationFn: () => closeRequirement(requirementId),
    onSuccess: () => router.refresh(),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={close.isPending}
      onClick={() => {
        // Existing threads keep going — closing only stops new approaches.
        if (
          window.confirm(
            "Close this requirement? It leaves the open board; existing threads continue.",
          )
        ) {
          close.mutate();
        }
      }}
    >
      {close.isPending ? "Closing…" : "Close"}
    </Button>
  );
}
