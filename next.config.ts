import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",         // Static HTML export for GitHub Pages
  trailingSlash: true,      // Required for gh-pages directory structure
  basePath: isProd ? "/neroLifeOS" : "",
  assetPrefix: isProd ? "/neroLifeOS/" : "",
  images: {
    unoptimized: true,      // No server-side image optimization in static mode
  },
};

export default nextConfig;
