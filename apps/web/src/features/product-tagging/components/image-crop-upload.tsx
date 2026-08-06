"use client";

import type { UploadKind } from "@plugfolio/core";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Slider,
} from "@plugfolio/ui";
import { Upload } from "lucide-react";
import { useImageCrop } from "../hooks/use-image-crop";

/**
 * Pick a file → frame it yourself → upload (ADR-0023). The dialog is a
 * canvas: drag to move the picture inside the fixed frame, zoom to close in
 * on what matters, and what you see is exactly what ships — the client crops
 * to the kind's box FIRST, so the server's centre-crop merely normalizes
 * (resize, watermark, WebP) and never re-frames.
 *
 * The pan/zoom/upload logic lives in `useImageCrop`; this file is the button
 * and the framing dialog.
 */
export type ImageCropUploadProps = {
  kind: UploadKind;
  onUploaded: (url: string) => void;
  label?: string;
};

const FRAME_CLASS: Record<UploadKind, string> = {
  avatar: "aspect-square",
  product: "aspect-square",
  post: "aspect-[4/5]",
  cover: "aspect-[2.5/1]",
};

export function ImageCropUpload({ kind, onUploaded, label = "Upload" }: ImageCropUploadProps) {
  const {
    inputRef,
    canvasRef,
    image,
    setImage,
    zoom,
    setZoom,
    box,
    upload,
    openFile,
    pointerHandlers,
  } = useImageCrop({ kind, onUploaded });

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) openFile(file);
          // Clear so re-picking the same file fires change again.
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {upload.isPending ? "Uploading…" : label}
      </Button>
      {upload.isError ? (
        <p role="alert" className="text-destructive text-micro">
          {upload.error.message}
        </p>
      ) : null}

      <Dialog open={image !== null} onOpenChange={(open) => !open && setImage(null)}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-display text-body font-bold tracking-[-0.02em]">
              Frame it
            </DialogTitle>
            <DialogDescription>
              Drag to move, zoom to focus. What you see here is exactly what shows.
            </DialogDescription>
          </DialogHeader>
          <div className={`${FRAME_CLASS[kind]} bg-active w-full overflow-hidden rounded-lg`}>
            <canvas
              ref={canvasRef}
              width={box.width}
              height={box.height}
              className="size-full cursor-move touch-none"
              {...pointerHandlers}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-faint text-pico tracking-eyebrow font-mono uppercase">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={4}
              step={0.01}
              onValueChange={([next]) => setZoom(next ?? 1)}
              aria-label="Zoom"
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setImage(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="action"
              disabled={upload.isPending}
              onClick={() => upload.mutate()}
            >
              {upload.isPending ? "Uploading…" : "Use this crop"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
