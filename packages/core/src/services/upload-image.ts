import { AppError } from "../errors";
import type { ImageProcessor, ImageStore } from "../ports/image-storage";
import { IMAGE_SPECS, MAX_UPLOAD_BYTES, sniffImageMime, type UploadKind } from "../schemas/image-upload";

/**
 * Upload one image (ADR-0023): validate at the boundary, normalize to the
 * kind's spec (crop + watermark + WebP), store, hand back the URL. The caller
 * saves that URL onto their own profile/post/product through the existing edit
 * services — which already role-check ownership — so this service only needs a
 * signed-in user, verified at the route.
 */
export type UploadImageDeps = {
  processor: ImageProcessor;
  store: ImageStore;
};

export type UploadedImage = { url: string; width: number; height: number };

export async function uploadImage(
  deps: UploadImageDeps,
  kind: UploadKind,
  file: { bytes: Uint8Array },
): Promise<UploadedImage> {
  if (file.bytes.byteLength === 0) throw new AppError("VALIDATION", "Empty file");
  if (file.bytes.byteLength > MAX_UPLOAD_BYTES) throw new AppError("VALIDATION", "Image too large");
  if (!sniffImageMime(file.bytes)) {
    throw new AppError("VALIDATION", "Unsupported image type — use JPEG, PNG or WebP");
  }

  const processed = await deps.processor.process(file.bytes, IMAGE_SPECS[kind]);
  const url = await deps.store.put(kind, processed);
  return { url, width: processed.width, height: processed.height };
}
