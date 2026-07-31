/**
 * Image upload seam (ADR-0023). Two ports the upload service depends on, both
 * implemented as gateways in apps/api — the only place the native `sharp` and
 * AWS SDK dependencies live, so neither reaches the web bundle or Storybook.
 *
 * A processed image is bytes + a content type; the service never learns it is
 * WebP, an S3 key, or a CDN URL — that is the adapter's business.
 */

/** How one kind of image is normalized: cover-crop to a fixed box, then WebP. */
export type ImageSpec = {
  width: number;
  height: number;
  /** WebP quality 1–100. */
  quality: number;
  /** Overlay the brand watermark (bottom-right). */
  watermark: boolean;
};

export type ProcessedImage = {
  bytes: Uint8Array;
  contentType: string;
  width: number;
  height: number;
};

/** Resize/crop → watermark → re-encode. Re-encoding strips all EXIF. */
export type ImageProcessor = {
  process(input: Uint8Array, spec: ImageSpec): Promise<ProcessedImage>;
};

/**
 * Store one processed image and return its public URL. The key is a content
 * hash the adapter computes, so re-uploading identical bytes is idempotent and
 * the object can be cached forever.
 */
export type ImageStore = {
  put(keyPrefix: string, image: ProcessedImage): Promise<string>;
};
