"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postRequirement } from "../api";

/** Post a brief to the open board: product, content wanted, budget, deadline. */
export function RequirementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");

  const submit = useMutation({
    mutationFn: () => postRequirement({ title, brief, budget: budget.trim() || null }),
    onSuccess: () => {
      setTitle("");
      setBrief("");
      setBudget("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim() && brief.trim()) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        What do you need?
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          placeholder="A 30s reel featuring our tote bag"
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        The brief
        <textarea
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          maxLength={1000}
          rows={3}
          required
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Budget or price range (optional)
        <input
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          maxLength={60}
          placeholder="$150–300"
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Posting…" : "Post requirement"}
      </Button>
    </form>
  );
}
