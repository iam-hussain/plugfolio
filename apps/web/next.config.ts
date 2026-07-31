import type { NextConfig } from "next";

// Allow next/image to optimize images served from our upload bucket/CDN
// (ADR-0023). Pasted third-party URLs stay `unoptimized` per-image.
const uploadBaseUrl = process.env.S3_PUBLIC_BASE_URL;
const uploadHost = uploadBaseUrl ? new URL(uploadBaseUrl).hostname : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(uploadHost
    ? { images: { remotePatterns: [{ protocol: "https", hostname: uploadHost }] } }
    : {}),
  // Compile shared workspace packages from source (no separate build step).
  transpilePackages: ["@plugfolio/ui", "@plugfolio/tokens", "@plugfolio/core", "@plugfolio/db"],
  typedRoutes: true,
  // Same-origin proxy to the standalone API (ADR-0008): browsers keep calling
  // /api/* on this origin (cookies just work, no CORS); mobile clients call
  // the API host directly. Must be a FALLBACK rewrite — afterFiles rewrites
  // run before dynamic routes, and Auth.js's /api/auth/[...nextauth] is
  // dynamic; fallback only fires when no route matched, so Auth.js stays
  // served by this app.
  async rewrites() {
    // Trimmed: a value pasted into a hosting dashboard picks up whitespace,
    // and the build then fails on "destination does not start with https://".
    const apiUrl = process.env.API_URL?.trim() || "http://localhost:3001";
    return {
      fallback: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
    };
  },
};

export default nextConfig;
