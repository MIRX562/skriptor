import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  images: {
    // Local assets are served directly; avoids shipping Sharp/libvips in the runtime image.
    unoptimized: true,
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
