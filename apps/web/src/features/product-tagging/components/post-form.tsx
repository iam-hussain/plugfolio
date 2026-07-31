"use client";

import type { CategoryView, PostMediaKind } from "@plugfolio/core";
import { Button, DashCard, DashField, NativeSelect, Textarea } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, updatePost } from "../api";
import { PostMediaFields } from "./post-media-fields";
import { ShelfOptions } from "./shelf-options";

/**
 * The post form (DESIGN post-edit.html) — the same screen for create and edit.
 *
 * Publish-free: a post goes live as soon as it's added, so there's no draft
 * state to explain and no Publish button to forget. The two media fields are
 * `PostMediaFields`, which carries the reasoning for why there are two.
 */
export type PostFormProps = {
  profileId: string;
  categories: readonly CategoryView[];
  /** Absent = create. Present = edit. */
  post?: {
    id: string;
    mediaUrl: string;
    mediaKind: PostMediaKind;
    embedUrl: string | null;
    sourceUrl: string | null;
    caption: string | null;
    categoryId: string | null;
  };
};

export function PostForm({ profileId, categories, post }: PostFormProps) {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState(post?.mediaUrl ?? "");
  const [mediaKind, setMediaKind] = useState<PostMediaKind>(post?.mediaKind ?? "still");
  const [videoUrl, setVideoUrl] = useState(post?.sourceUrl ?? post?.embedUrl ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");

  const body = () => ({
    mediaUrl,
    mediaKind,
    embedUrl: mediaKind === "still" ? null : videoUrl.trim() || null,
    sourceUrl: mediaKind === "still" ? null : videoUrl.trim() || null,
    caption: caption.trim() || null,
    categoryId: categoryId || null,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (post) {
        await updatePost(post.id, profileId, body());
        return null;
      }
      const created = await createPost({ profileId, ...body() });
      return created.post.id;
    },
    onSuccess: (createdId) => {
      // Straight into its own editor: a post exists so it can be tagged, and
      // making the creator go and find it again is the step this page removes.
      if (createdId) router.push(`/dashboard/posts/${createdId}?profile=${profileId}` as Route);
      else router.refresh();
    },
  });

  const isVideo = mediaKind !== "still";
  const ready = mediaUrl.trim() !== "" && (!isVideo || videoUrl.trim() !== "");

  return (
    <DashCard>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) save.mutate();
        }}
      >
        <PostMediaFields
          mediaUrl={mediaUrl}
          onMediaUrlChange={setMediaUrl}
          mediaKind={mediaKind}
          onMediaKindChange={setMediaKind}
          videoUrl={videoUrl}
          onVideoUrlChange={setVideoUrl}
        />

        <DashField label="Caption" htmlFor="post-caption">
          <Textarea
            id="post-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
            className="min-h-[84px]"
          />
        </DashField>

        {categories.length > 0 ? (
          <DashField
            label="Shelf"
            htmlFor="post-shelf"
            note="A shelf is never required before a post goes live."
          >
            <NativeSelect
              id="post-shelf"
              className="w-full"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <ShelfOptions categories={categories} />
            </NativeSelect>
          </DashField>
        ) : null}

        {save.isError ? (
          <p role="alert" className="text-destructive text-copy mb-3.5">
            {save.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          variant={post ? "outline" : "default"}
          disabled={!ready || save.isPending}
        >
          {save.isPending ? "Saving…" : post ? "Save post" : "Add post"}
        </Button>
        {post ? null : (
          <p className="text-faint text-micro mt-2.5">It goes live as soon as you add it.</p>
        )}
      </form>
    </DashCard>
  );
}
