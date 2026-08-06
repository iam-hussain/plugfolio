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
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadImage } from "../api";

/**
 * Pick a file → frame it yourself → upload (ADR-0023). The dialog is a
 * canvas: drag to move the picture inside the fixed frame, zoom to close in
 * on what matters, and what you see is exactly what ships — the client crops
 * to the kind's box FIRST, so the server's centre-crop merely normalizes
 * (resize, watermark, WebP) and never re-frames.
 *
 * A canvas, not a transformed <img>, on purpose: the pan/zoom is imperative
 * drawing, so no inline styles (§7) and no cropper dependency.
 */
export type ImageCropUploadProps = {
  kind: UploadKind;
  onUploaded: (url: string) => void;
  label?: string;
};

/** Output boxes, mirroring core's IMAGE_SPECS — literal here because a value
    import from @plugfolio/core would drag node:crypto into the bundle. */
const BOXES: Record<UploadKind, { width: number; height: number }> = {
  avatar: { width: 400, height: 400 },
  product: { width: 800, height: 800 },
  post: { width: 1080, height: 1350 },
  cover: { width: 1600, height: 640 },
};

const FRAME_CLASS: Record<UploadKind, string> = {
  avatar: "aspect-square",
  product: "aspect-square",
  post: "aspect-[4/5]",
  cover: "aspect-[2.5/1]",
};

export function ImageCropUpload({ kind, onUploaded, label = "Upload" }: ImageCropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  // Pan in canvas pixels, clamped so the picture always covers the frame.
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const box = BOXES[kind];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const cover = Math.max(box.width / image.width, box.height / image.height);
    const scale = cover * zoom;
    const drawn = { width: image.width * scale, height: image.height * scale };
    // Clamp the pan so no edge shows.
    const maxX = (drawn.width - box.width) / 2;
    const maxY = (drawn.height - box.height) / 2;
    pan.current.x = Math.min(maxX, Math.max(-maxX, pan.current.x));
    pan.current.y = Math.min(maxY, Math.max(-maxY, pan.current.y));
    context.clearRect(0, 0, box.width, box.height);
    context.drawImage(
      image,
      (box.width - drawn.width) / 2 + pan.current.x,
      (box.height - drawn.height) / 2 + pan.current.y,
      drawn.width,
      drawn.height,
    );
  }, [image, zoom, box.width, box.height]);

  useEffect(() => {
    draw();
  }, [draw]);

  const upload = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Nothing to crop");
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("Could not read the crop");
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      return uploadImage(kind, file);
    },
    onSuccess: (url) => {
      onUploaded(url);
      setImage(null);
    },
  });

  const openFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const next = new Image();
    next.onload = () => {
      pan.current = { x: 0, y: 0 };
      setZoom(1);
      setImage(next);
      URL.revokeObjectURL(url);
    };
    next.src = url;
  };

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
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, y: event.clientY };
              }}
              onPointerMove={(event) => {
                if (!drag.current) return;
                // Screen pixels → canvas pixels, so the picture tracks the finger.
                const ratio = box.width / event.currentTarget.clientWidth;
                pan.current.x += (event.clientX - drag.current.x) * ratio;
                pan.current.y += (event.clientY - drag.current.y) * ratio;
                drag.current = { x: event.clientX, y: event.clientY };
                draw();
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
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
