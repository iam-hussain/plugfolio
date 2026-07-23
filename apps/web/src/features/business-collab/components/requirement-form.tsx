"use client";

import { Button, Input, Label, Textarea } from "@plugfolio/ui";
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
  const [deadline, setDeadline] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      postRequirement({
        title,
        brief,
        budget: budget.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
      }),
    onSuccess: () => {
      setTitle("");
      setBrief("");
      setBudget("");
      setDeadline("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim() && brief.trim()) submit.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirement-title">What do you need?</Label>
        <Input
          id="requirement-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          placeholder="A 30s reel featuring our tote bag"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="requirement-brief">The brief</Label>
        <Textarea
          id="requirement-brief"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          maxLength={1000}
          rows={3}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requirement-budget">Budget (optional)</Label>
          <Input
            id="requirement-budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            maxLength={60}
            placeholder="$150–300"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requirement-deadline">Deadline (optional)</Label>
          <Input
            id="requirement-deadline"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </div>
      </div>
      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Posting…" : "Post requirement"}
      </Button>
    </form>
  );
}
