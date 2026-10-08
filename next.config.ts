import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo-name>. Leave empty when using a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // The dev badge sits on top of the slideshow controls in every corner.
  devIndicators: false,
  // Let phones on the home Wi-Fi open the dev server by its local address (e.g. http://192.168.1.11:3123).
  allowedDevOrigins: ["192.168.*.*"],
  // Disk space on the dev machine is tight: don't keep Turbopack's compile cache between runs
  // (it grew to ~700MB). Costs slower restarts; the site itself is unaffected.
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
