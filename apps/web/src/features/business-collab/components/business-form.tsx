"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBusiness } from "../api";

/** Business sign-up (lean journey: name, what you sell — that's it in v1). */
export function BusinessForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = useMutation({
    mutationFn: () => createBusiness({ name, description }),
    onSuccess: () => router.refresh(),
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && description.trim()) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Business name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        What do you sell?
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={280}
          rows={2}
          required
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Creating…" : "Create business"}
      </Button>
    </form>
  );
}
