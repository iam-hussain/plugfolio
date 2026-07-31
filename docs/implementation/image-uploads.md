# Image uploads — avatar, product & post (ADR-0023)

**Journey served:** the creator building a page (lean journey — "a live, shoppable page in under five minutes"). Replaces "paste an image URL" with a real upload for the three images a creator controls: their **avatar**, a **post** still, and a **product** image. Doesn't change the buy loop — it's how images get onto the page, not a new screen.

## Flow

Pick a file → `POST /api/uploads/:kind` (multipart, auth'd) → the API crops to the kind's box, watermarks, re-encodes to WebP and puts it on S3 → returns `{ url, width, height }` → the form saves that URL onto the profile/post/product through the **existing** edit route. **No schema change** — the processed image is just a URL string in `avatarUrl`/`mediaUrl`/`imageUrl`.

## Processing (per kind)

| Kind | Cover-crop | Format | Watermark |
|---|---|---|---|
| `avatar` | 400×400 | WebP q80 | yes (sized down) |
| `product` | 800×800 | WebP q80 | yes |
| `post` | 1080×1350 (4:5) | WebP q82 | yes |

Re-encoding strips EXIF (GPS included) and can't carry a payload; `sharp` runs with a 24M-pixel `limitInputPixels` bomb guard. The watermark is an SVG wordmark drawn at request time — no binary asset in the repo.

## Layers

- **`@plugfolio/core`** — `ports/image-storage.ts` (`ImageProcessor`, `ImageStore`), `schemas/image-upload.ts` (`uploadKind`, `IMAGE_SPECS`, `MAX_UPLOAD_BYTES`, `sniffImageMime`), `services/upload-image.ts`. Framework- and `sharp`-free; unit-tested with fakes.
- **`apps/api`** — `gateways/sharp-image-processor.ts`, `gateways/s3-image-store.ts` (content-hash key, `immutable` cache), route `POST /api/uploads/:kind`, `imageUploadDeps` wired in `container.ts` env-gated on `S3_REGION`+`S3_BUCKET`+`S3_PUBLIC_BASE_URL`.
- **`apps/web`** — `uploadImage` in `product-tagging/api.ts`, `ImageUploadButton` component; wired into `ProfileIdentityForm` (avatar), `PostMediaFields` (post), and `ProductEditor` (product, edit-only). `next.config.ts` adds the bucket host to `images.remotePatterns`.

## Validation (trust boundary)

Magic-byte sniff (JPEG/PNG/WebP only — SVG and animated GIF rejected by omission), 12 MB cap, empty-file reject. An authed user can upload arbitrary images to the bucket; rate limiting is deferred.

## Edge cases & deferred

- **Product image on create:** a new product still scrapes its image from the source URL (OG metadata); a replacement uploads on the edit screen. An explicit upload overrides the scrape.
- **Not configured:** no S3 env → the route returns "not configured"; dev boots without AWS, the paste-URL fallback still works.
- **Deferred (ADR-0023):** orphan cleanup on replace, CDN + multi-size derivatives, presigned+Lambda pipeline, upload rate limiting.
