"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost } from "../api";

/**
 * Manual post creation — the interim content source until social import
 * lands (the lean journey's auto-import needs approved YouTube/IG API apps).
 */
export type NewPostFormProps = {
  profileId: string;
};

export function NewPostForm({ profileId }: NewPostFormProps) {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");

  const submit = useMutation({
    mutationFn: () => createPost({ profileId, mediaUrl, caption: caption.trim() || null }),
    onSuccess: () => {
      setMediaUrl("");
      setCaption("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (mediaUrl.trim()) submit.mutate();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Media URL
        <input
          type="url"
          value={mediaUrl}
          onChange={(event) => setMediaUrl(event.target.value)}
          required
          placeholder="https://…/reel-cover.jpg"
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Caption (optional)
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={500}
          className="border-border bg-background rounded-md border p-2"
        />
      </label>
      {submit.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={submit.isPending}>
        {submit.isPending ? "Adding…" : "Add post"}
      </Button>
    </form>
  );
}
