import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ImageStore, ProcessedImage } from "@plugfolio/core";

/**
 * S3 object store (ADR-0023). The key is a content hash, so identical bytes
 * land on one object (idempotent re-uploads) and every object is immutable —
 * hence the year-long, immutable cache header. AWS credentials come from the
 * standard provider chain (env or the instance's IAM role), never our env.ts.
 */
export type S3ImageStoreConfig = {
  region: string;
  bucket: string;
  /** Public origin objects are served from — the bucket URL or a CDN. */
  publicBaseUrl: string;
};

export function createS3ImageStore(config: S3ImageStoreConfig): ImageStore {
  const client = new S3Client({ region: config.region });
  const base = config.publicBaseUrl.replace(/\/+$/, "");

  return {
    async put(keyPrefix: string, image: ProcessedImage): Promise<string> {
      const hash = createHash("sha256").update(image.bytes).digest("hex");
      const key = `${keyPrefix}/${hash}.webp`;
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: image.bytes,
          ContentType: image.contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      return `${base}/${key}`;
    },
  };
}
