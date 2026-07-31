import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The Prisma query engine, forced into the serverless bundle. The build
  // copies it to generated/client/ first (see this app's build script) because
  // a lambda is assembled from the trace — a .node file nothing imports is
  // dropped no matter which directory it sits in. This path is the first one
  // Prisma searches at runtime (/var/task/apps/<app>/generated/client).
  outputFileTracingIncludes: { "/**/*": ["./generated/client/*.node"] },
  // Compile shared workspace packages from source (no separate build step).
  transpilePackages: ["@plugfolio/ui", "@plugfolio/tokens", "@plugfolio/core", "@plugfolio/db"],
  typedRoutes: true,
};

export default nextConfig;
