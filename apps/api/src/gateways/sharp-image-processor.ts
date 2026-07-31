import sharp from "sharp";
import type { ImageProcessor, ImageSpec, ProcessedImage } from "@plugfolio/core";

/**
 * The image pipeline (ADR-0023): cover-crop to the kind's box, drop the brand
 * watermark bottom-right, re-encode to WebP. Re-encoding is also the sanitizer
 * — it strips all EXIF (GPS included) and cannot carry an embedded payload.
 *
 * The watermark is drawn from an SVG wordmark at request time, sized to the
 * image, so there is no binary asset to keep in the repo.
 */

// Decompression-bomb guard: refuse to decode absurd pixel counts (§8 security).
const MAX_INPUT_PIXELS = 24_000_000;

function watermark(imageWidth: number): { svg: Buffer; width: number; height: number } {
  const width = Math.round(imageWidth * 0.34);
  const height = Math.round(width * 0.26);
  const fontSize = Math.round(height * 0.52);
  const stroke = Math.max(1, Math.round(fontSize * 0.05));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="-0.02em" fill="#ffffff" fill-opacity="0.6" style="paint-order:stroke" stroke="#12101C" stroke-opacity="0.22" stroke-width="${stroke}">plugfolio</text></svg>`;
  return { svg: Buffer.from(svg), width, height };
}

export function createSharpImageProcessor(): ImageProcessor {
  return {
    async process(input: Uint8Array, spec: ImageSpec): Promise<ProcessedImage> {
      const base = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
        .rotate() // bake EXIF orientation in before metadata is stripped
        .resize(spec.width, spec.height, { fit: "cover", position: "attention" });

      if (spec.watermark) {
        const mark = watermark(spec.width);
        const margin = Math.round(spec.width * 0.03);
        base.composite([
          {
            input: mark.svg,
            top: spec.height - mark.height - margin,
            left: spec.width - mark.width - margin,
          },
        ]);
      }

      const { data, info } = await base.webp({ quality: spec.quality }).toBuffer({
        resolveWithObject: true,
      });
      return {
        bytes: new Uint8Array(data),
        contentType: "image/webp",
        width: info.width,
        height: info.height,
      };
    },
  };
}
