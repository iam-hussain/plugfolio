"use client";

import type { PostMediaKind } from "@plugfolio/core";
import { DashField, DashFieldRow, Input, NativeSelect, NativeSelectOption } from "@plugfolio/ui";

/**
 * The photo and the video — two fields, deliberately, not one "media type"
 * select.
 *
 * A photo is not a fourth kind of social video: it's an image you own, and it
 * can sit *alongside* a video rather than instead of it. The still is what a
 * visitor sees before pressing play, and what a link unfurls to when it's
 * shared (ADR-0019).
 *
 * One field for the video link, because the embed URL and the "watch it there
 * instead" link are the same address to a creator — the facade derives both.
 */
const VIDEO_SOURCES: { value: PostMediaKind; label: string }[] = [
  { value: "still", label: "None" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
];

export type PostMediaFieldsProps = {
  mediaUrl: string;
  onMediaUrlChange: (value: string) => void;
  mediaKind: PostMediaKind;
  onMediaKindChange: (value: PostMediaKind) => void;
  videoUrl: string;
  onVideoUrlChange: (value: string) => void;
};

export function PostMediaFields({
  mediaUrl,
  onMediaUrlChange,
  mediaKind,
  onMediaKindChange,
  videoUrl,
  onVideoUrlChange,
}: PostMediaFieldsProps) {
  const isVideo = mediaKind !== "still";

  return (
    <>
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
          onChange={(event) => onMediaUrlChange(event.target.value)}
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
              onChange={(event) => onMediaKindChange(event.target.value as PostMediaKind)}
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
            onChange={(event) => onVideoUrlChange(event.target.value)}
            placeholder="Paste the video link"
            disabled={!isVideo}
          />
        </DashFieldRow>
      </DashField>
    </>
  );
}
