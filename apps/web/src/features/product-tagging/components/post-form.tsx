"use client";

import type { CategoryView, PostMediaKind } from "@plugfolio/core";
import {
  Button,
  DashCard,
  DashField,
  DashFieldRow,
  Input,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost, updatePost } from "../api";

/**
 * The post form (DESIGN post-edit.html) — the same screen for create and edit.
 *
 * Two media fields, not one select. A photo is not a fourth kind of social
 * video: it's an image you own, and it can sit *alongside* a video rather than
 * instead of it. The still is what a visitor sees before pressing play, and
 * what a link unfurls to when it's shared (ADR-0019).
 *
 * Publish-free: a post goes live as soon as it's added, so there's no draft
 * state to explain and no Publish button to forget.
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

const VIDEO_SOURCES: { value: PostMediaKind; label: string }[] = [
  { value: "still", label: "None" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
];

export function PostForm({ profileId, categories, post }: PostFormProps) {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState(post?.mediaUrl ?? "");
  const [mediaKind, setMediaKind] = useState<PostMediaKind>(post?.mediaKind ?? "still");
  // One field for the video link. The embed URL and the "watch it there
  // instead" link are the same address to a creator; the facade derives both.
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
        <DashField
          label="Photo"
          hint="· optional on a video"
          htmlFor="post-photo"
          note="Shown on its own, or as the still behind a video’s play button. Also what your link unfurls to when it is shared."
        >
          <Input
            id="post-photo"
            type="url"
            value={mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
            placeholder="https://…"
            required
          />
        </DashField>

        <DashField
          label="Video"
          hint="· optional"
          htmlFor="post-video"
          note="Shows as a play frame and only loads when a visitor presses it — nothing reaches YouTube, Instagram or TikTok before that."
        >
          <DashFieldRow className="mt-0">
            <label className="flex-[0_1_150px]">
              <span className="sr-only">Video source</span>
              <NativeSelect
                className="w-full"
                value={mediaKind}
                onChange={(event) => setMediaKind(event.target.value as PostMediaKind)}
              >
                {VIDEO_SOURCES.map((source) => (
                  <NativeSelectOption key={source.value} value={source.value}>
                    {source.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            <Input
              id="post-video"
              type="url"
              className="flex-[1_1_200px]"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="Paste the video link"
              disabled={!isVideo}
            />
          </DashFieldRow>
        </DashField>

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
              <NativeSelectOption value="">None</NativeSelectOption>
              {categories.map((category) => (
                <NativeSelectOption key={category.id} value={category.id}>
                  {category.title}
                </NativeSelectOption>
              ))}
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
