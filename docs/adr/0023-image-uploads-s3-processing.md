# ADR-0023 — Image uploads: S3, watermarked and cropped in the API

## Context

Every image in v1 was a pasted URL string (`Profile.avatarUrl`, `Post.mediaUrl`,
`Product.imageUrl`) — "no upload infra in v1", repeated in the schema, the docs
and the UI copy. Creators pasting a hotlinked image is fragile (it rots, it can
be huge, it isn't ours, it carries EXIF). We want real uploads for avatar,
product and post images: stored by us, cropped to a predictable box, and
watermarked.

Watermark and crop **must** happen server-side and trusted, which rules out the
usual "presigned PUT straight to S3" pattern — that would land raw client bytes
in the bucket, unprocessed. The API (`apps/api`, ADR-0008) is a standing Hono
process, not serverless, so routing bytes through it to process is fine.

## Decision

**Upload through the API; process with `sharp`; store on S3; return a URL.**

- **Ports in `@plugfolio/core`** (`ImageProcessor`, `ImageStore`) plus an
  `uploadImage` service and the per-kind spec (`IMAGE_SPECS`) + magic-byte
  `sniffImageMime`. Framework- and `sharp`-free, so it stays unit-testable and
  never drags a native binary into web/Storybook.
- **Gateways in `apps/api`** implement the ports: `sharp` (cover-crop → SVG
  wordmark watermark → WebP, EXIF stripped by re-encode, `limitInputPixels`
  bomb guard) and `@aws-sdk/client-s3` (content-hash key, `immutable` cache).
  These are the only place the two native deps live.
- **Route `POST /api/uploads/:kind`** — auth'd, multipart via Hono's native
  `parseBody`, size + type validated at the boundary. Returns `{ url }`.
- **No schema change.** The processed image is a URL, saved onto the existing
  `avatarUrl`/`mediaUrl`/`imageUrl` fields through the edit services that
  already role-check ownership. The web forms keep the paste field as a
  fallback and add an upload button.
- **Watermark on all three kinds** (product decision), sized proportionally so
  it reads as a mark on a 400px avatar, not a stamp.
- **Env-gated** (`S3_REGION` + `S3_BUCKET` + `S3_PUBLIC_BASE_URL`): unset, the
  route reports uploads unavailable and dev boots without AWS. Credentials come
  from the standard AWS provider chain (env or IAM role), never `env.ts`.

## Consequences

- Two deps in `apps/api` only: `sharp`, `@aws-sdk/client-s3`. `sharp` ships a
  prebuilt binary; the deploy image must match the runtime platform/arch.
- `next/image` gets one `remotePatterns` entry (the bucket/CDN host) so our
  images optimize; pasted third-party URLs stay `unoptimized` per-image.
- A CDN (CloudFront) in front of S3 and multi-size derivatives are the delivery
  upgrade path — not built; one processed WebP + `next/image` covers launch.
- **Deferred:** orphan cleanup when an image is replaced (objects are cheap;
  an S3 lifecycle rule or a reference sweep lands later), presigned+Lambda
  pipeline, per-user upload rate limiting, product-image upload on *create*
  (new products still scrape from the source URL; a replacement uploads on edit).

## Status

Accepted — July 2026.
