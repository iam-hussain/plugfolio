"use client";

import type { UploadKind } from "@plugfolio/core";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { uploadImage } from "../api";

/**
 * Everything the crop dialog *does* (ADR-0023): hold the picked image, pan/zoom
 * it imperatively onto a canvas, and upload the exact crop the creator framed.
 *
 * A canvas, not a transformed <img>, on purpose: the pan/zoom is imperative
 * drawing, so no inline styles (§7) and no cropper dependency. Pulled out of the
 * component so the drawing maths reads on its own and the dialog stays markup.
 */

/** Output boxes, mirroring core's IMAGE_SPECS — literal here because a value
    import from @plugfolio/core would drag node:crypto into the bundle. */
const BOXES: Record<UploadKind, { width: number; height: number }> = {
  avatar: { width: 400, height: 400 },
  product: { width: 800, height: 800 },
  post: { width: 1080, height: 1350 },
  cover: { width: 1600, height: 640 },
};

export function useImageCrop({
  kind,
  onUploaded,
}: {
  kind: UploadKind;
  onUploaded: (url: string) => void;
}) {
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

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    // Screen pixels → canvas pixels, so the picture tracks the finger.
    const ratio = box.width / event.currentTarget.clientWidth;
    pan.current.x += (event.clientX - drag.current.x) * ratio;
    pan.current.y += (event.clientY - drag.current.y) * ratio;
    drag.current = { x: event.clientX, y: event.clientY };
    draw();
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return {
    inputRef,
    canvasRef,
    image,
    setImage,
    zoom,
    setZoom,
    box,
    upload,
    openFile,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
