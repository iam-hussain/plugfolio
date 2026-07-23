"use client";

import { Button, Input, Label, Textarea } from "@plugfolio/ui";
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
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && description.trim()) submit.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-name">Business name</Label>
        <Input
          id="business-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business-description">What do you sell?</Label>
        <Textarea
          id="business-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={280}
          rows={2}
          required
        />
      </div>
      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Creating…" : "Create business"}
      </Button>
    </form>
  );
}
