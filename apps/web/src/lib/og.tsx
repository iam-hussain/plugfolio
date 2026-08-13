import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand } from "@plugfolio/tokens";
import sharp from "sharp";
import { SITE_URL } from "./site";

/**
 * Shared vocabulary for the dynamic share cards (opengraph-image routes): the
 * 1200×630 frame, the bundled fonts, the on-dark brand lockup and the lime
 * promise chip, plus a safe image fetcher. Satori (next/og) styles only —
 * every multi-child div carries display:flex.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** Fonts ship in src/assets/fonts (OFL) so generation never needs the network. */
export async function ogFonts() {
  const [sora, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/sora-bold.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/inter-regular.ttf")),
  ]);
  return [
    { name: "Sora", data: sora, weight: 700, style: "normal" },
    { name: "Inter", data: inter, weight: 400, style: "normal" },
  ] as const;
}

/** The formats satori can rasterize itself — everything else gets transcoded. */
const SATORI_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif"]);

/**
 * Fetch page media/avatars into a data URI so a slow or dead image host can
 * never 500 the share card — a failed fetch just means the branded fallback.
 * Our own uploads are WebP (ADR-0023), which satori cannot decode, so anything
 * outside its formats is transcoded to PNG with sharp.
 */
export async function ogImageData(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const absolute = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  try {
    const res = await fetch(absolute, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (SATORI_IMAGE_TYPES.has(type)) {
      return `data:${type};base64,${buffer.toString("base64")}`;
    }
    const png = await sharp(buffer).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/** The card ground — the root OG image's ink→violet sweep, shared by all cards. */
export const ogGround = `linear-gradient(150deg, ${brand.ink} 55%, ${brand.violetDeep} 130%)`;

/** The on-dark brand lockup (white body, lime prongs & spark). */
export function OgLockup({ mark = 44, word = 34 }: { mark?: number; word?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={mark} height={mark} viewBox="0 0 100 100">
        <g strokeWidth={3} strokeLinejoin="round">
          <polygon points="33,53 33,27 39.5,15 46,27 46,53" fill={brand.lime} stroke={brand.lime} />
          <polygon points="54,53 54,27 60.5,15 67,27 67,53" fill={brand.lime} stroke={brand.lime} />
          <rect x="18" y="43" width="64" height="44" rx="13" fill="#FFFFFF" stroke="#FFFFFF" />
        </g>
      </svg>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span
          style={{ fontFamily: "Sora", fontSize: word, color: "#FFFFFF", letterSpacing: "-0.045em" }}
        >
          plugfolio
        </span>
        <div
          style={{
            width: word * 0.2,
            height: word * 0.2,
            borderRadius: 3,
            background: brand.lime,
            marginLeft: 6,
            marginBottom: word * 0.2,
          }}
        />
      </div>
    </div>
  );
}

/** The lime promise chip — fill + ink text, the sanctioned lime moment. */
export function OgChip({ children }: { children: string }) {
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: brand.lime,
          color: brand.ink,
          borderRadius: 999,
          padding: "12px 26px",
          fontSize: 21,
          fontFamily: "Sora",
          letterSpacing: "0.04em",
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: 999, background: brand.ink }} />
        {children}
      </div>
    </div>
  );
}
