import { ImageResponse } from "next/og";
import { brand } from "@plugfolio/tokens";

// ADMIN home-screen tile: the dark-surface treatment (lime mark on Ink) so a
// pinned admin app reads differently from the violet web tile. Same flat
// PlugMark geometry; iOS rounds the corners itself — full-bleed background.
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
          background: brand.ink,
        }}
      >
        <svg width="128" height="128" viewBox="0 0 100 100">
          <g
            transform="translate(50 51) scale(0.9) translate(-50 -51)"
            fill={brand.lime}
            stroke={brand.lime}
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
