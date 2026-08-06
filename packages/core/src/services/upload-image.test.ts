import { describe, expect, it } from "vitest";
import { AppError } from "../errors";
import type { ProcessedImage } from "../ports/image-storage";
import { IMAGE_SPECS } from "../schemas/image-upload";
import { uploadImage, type UploadImageDeps } from "./upload-image";

// A minimal valid JPEG header (SOI + APP0 marker) — enough to pass the sniff.
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const NOT_AN_IMAGE = new Uint8Array([0x3c, 0x73, 0x76, 0x67]); // "<svg"

function makeDeps(): UploadImageDeps & { seenSpec?: unknown; putKey?: string } {
  const out: UploadImageDeps & { seenSpec?: unknown; putKey?: string } = {
    processor: {
      async process(_input, spec) {
        out.seenSpec = spec;
        return {
          bytes: new Uint8Array([1, 2, 3]),
          contentType: "image/webp",
          width: spec.width,
          height: spec.height,
        };
      },
    },
    store: {
      async put(prefix: string, image: ProcessedImage) {
        out.putKey = prefix;
        return `https://cdn.test/${prefix}/${image.width}x${image.height}.webp`;
      },
    },
  };
  return out;
}

describe("uploadImage", () => {
  it("rejects a non-image by its bytes, not its declared type", async () => {
    await expect(uploadImage(makeDeps(), "avatar", { bytes: NOT_AN_IMAGE })).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("rejects an empty file", async () => {
    await expect(
      uploadImage(makeDeps(), "post", { bytes: new Uint8Array() }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("processes with the kind's spec and returns the stored URL", async () => {
    const deps = makeDeps();
    const result = await uploadImage(deps, "post", { bytes: JPEG });
    expect(deps.seenSpec).toEqual(IMAGE_SPECS.post);
    expect(deps.putKey).toBe("post");
    expect(result).toEqual({
      url: "https://cdn.test/post/1080x1350.webp",
      width: 1080,
      height: 1350,
    });
  });
});
