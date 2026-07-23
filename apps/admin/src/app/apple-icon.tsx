import { ImageResponse } from "next/og";
import { brand } from "@plugfolio/tokens";

// iOS home-screen tile: flat white PlugMark on Brand Violet (under-24px flat
// rule doesn't apply at 180px, but the tile lockup is the flat symbol per the
// app-tile spec). iOS rounds the corners itself — full-bleed background.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.violet,
        }}
      >
        <svg width="128" height="128" viewBox="0 0 100 100">
          <g
            transform="translate(50 51) scale(0.9) translate(-50 -51)"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinejoin="round"
          >
            <polygon points="33,53 33,27 39.5,15 46,27 46,53" />
            <polygon points="54,53 54,27 60.5,15 67,27 67,53" />
            <rect x="18" y="43" width="64" height="44" rx="13" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
