"use client";

import { Button, Input, Label } from "@plugfolio/ui";
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
  onDone?: () => void;
};

export function NewPostForm({ profileId, onDone }: NewPostFormProps) {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");

  const submit = useMutation({
    mutationFn: () => createPost({ profileId, mediaUrl, caption: caption.trim() || null }),
    onSuccess: () => {
      setMediaUrl("");
      setCaption("");
      router.refresh();
      onDone?.();
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (mediaUrl.trim()) submit.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="post-media-url">Media URL</Label>
        <Input
          id="post-media-url"
          type="url"
          value={mediaUrl}
          onChange={(event) => setMediaUrl(event.target.value)}
          required
          placeholder="https://…/reel-cover.jpg"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="post-caption">Caption (optional)</Label>
        <Input
          id="post-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={500}
        />
      </div>
      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? "Adding…" : "Add post"}
      </Button>
    </form>
  );
}
