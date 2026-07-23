import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@plugfolio/tokens";
import { SITE_DESCRIPTION } from "@/lib/site";

/**
 * Social share card (og:image, 1200×630): dark ink surface, the on-dark mark
 * lockup (white body, lime prongs & spark), the landing headline, and the
 * "no login to shop" promise as a lime chip. Fonts ship in src/assets/fonts
 * (OFL) so generation never depends on the network.
 */
export const alt = "Plugfolio — buy what your favorites post. No login to shop.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [sora, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/sora-bold.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/inter-regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: `linear-gradient(150deg, ${brand.ink} 55%, ${brand.violetDeep} 130%)`,
          fontFamily: "Inter",
        }}
      >
        {/* lockup — on-dark rule: white body, lime prongs, lime spark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 100 100">
            <g strokeWidth={3} strokeLinejoin="round">
              <polygon
                points="33,53 33,27 39.5,15 46,27 46,53"
                fill={brand.lime}
                stroke={brand.lime}
              />
              <polygon
                points="54,53 54,27 60.5,15 67,27 67,53"
                fill={brand.lime}
                stroke={brand.lime}
              />
              <rect x="18" y="43" width="64" height="44" rx="13" fill="#FFFFFF" stroke="#FFFFFF" />
            </g>
          </svg>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span
              style={{
                fontFamily: "Sora",
                fontSize: 44,
                color: "#FFFFFF",
                letterSpacing: "-0.045em",
              }}
            >
              plugfolio
            </span>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: brand.lime,
                marginLeft: 7,
                marginBottom: 10,
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Sora",
              fontSize: 84,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
            }}
          >
            Buy what your favorites post.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.72)",
              marginTop: 26,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        {/* the honesty promise — sanctioned lime moment: fill + ink text */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: brand.lime,
              color: brand.ink,
              borderRadius: 999,
              padding: "14px 30px",
              fontSize: 24,
              fontFamily: "Sora",
              letterSpacing: "0.04em",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: brand.ink }} />
            NO LOGIN TO SHOP
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sora", data: sora, weight: 700, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    },
  );
}
