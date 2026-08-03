import { z } from "zod";
import type { ImageSpec } from "../ports/image-storage";

/**
 * Upload boundary (ADR-0023). The surfaces that take a real image; each is
 * cover-cropped to a fixed box so the page never depends on what a creator
 * happened to upload. Watermark on all per product decision. The client crops
 * to the box FIRST (the crop dialog), so the server's centre-crop is a
 * normalizer, not the framing decision.
 */
export const uploadKind = z.enum(["avatar", "product", "post", "cover"]);
export type UploadKind = z.infer<typeof uploadKind>;

/** Reject before decode; a phone photo is a few MB, 12 is generous headroom. */
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export const IMAGE_SPECS: Record<UploadKind, ImageSpec> = {
  // Square, small — the watermark is sized down proportionally so it reads as
  // a mark, not a stamp over a 400px face.
  avatar: { width: 400, height: 400, quality: 80, watermark: true },
  product: { width: 800, height: 800, quality: 80, watermark: true },
  // 4:5 portrait — the Instagram-native frame the shopper surface is built for.
  post: { width: 1080, height: 1350, quality: 82, watermark: true },
  // The page cover band (v2): wide and shallow — 2.5:1 covers every treatment
  // (band/tile/split) at the 1060 measure without upscaling.
  cover: { width: 1600, height: 640, quality: 80, watermark: true },
};

/**
 * Magic-byte sniff at the trust boundary — never trust the client's
 * Content-Type. Only these three raster formats; SVG (script vector) and
 * animated GIF are rejected by omission.
 */
export function sniffImageMime(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
