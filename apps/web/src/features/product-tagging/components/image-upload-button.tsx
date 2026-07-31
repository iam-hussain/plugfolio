"use client";

import type { UploadKind } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { uploadImage } from "../api";

/**
 * Pick a file → the API crops, watermarks and stores it (ADR-0023) → the
 * returned URL is handed back so the surrounding form saves it like any other
 * value. The URL field stays as a paste fallback; this is the primary path.
 */
export type ImageUploadButtonProps = {
  kind: UploadKind;
  onUploaded: (url: string) => void;
  label?: string;
};

export function ImageUploadButton({ kind, onUploaded, label = "Upload" }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useMutation({
    mutationFn: (file: File) => uploadImage(kind, file),
    onSuccess: onUploaded,
  });

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate(file);
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
    </div>
  );
}
