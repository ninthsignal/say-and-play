import type { NextConfig } from "next";

const repo = "say-and-play";
const isProd = process.env.NODE_ENV === "production";
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

// Allow the deployment target to choose a base path through env; default to none for custom domains.
const basePath =
  configuredBasePath !== undefined
    ? configuredBasePath
    : isProd && process.env.NEXT_PUBLIC_USE_REPO_BASE === "true"
      ? `/${repo}`
      : "";

const assetPrefix = basePath ? `${basePath.replace(/\/$/, "")}/` : undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
