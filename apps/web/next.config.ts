import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    return {
      fallback: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
    };
  },
};

export default nextConfig;
