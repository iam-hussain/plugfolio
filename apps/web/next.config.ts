import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Compile shared workspace packages from source (no separate build step).
  transpilePackages: ["@plugfolio/ui", "@plugfolio/tokens", "@plugfolio/core", "@plugfolio/db"],
  typedRoutes: true,
};

export default nextConfig;
