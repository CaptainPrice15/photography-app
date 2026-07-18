import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All photos are served through our own /api/photos decrypting proxy, and
    // several formats (heic, tiff, …) are already unoptimized. The Next.js
    // built-in image optimizer is not bundled with the App Router server on
    // Vercel (it requires .next/server/pages/_next/image.js which is absent),
    // so disable it to avoid MODULE_NOT_FOUND crashes on /_next/image requests.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 1 day
  },
};

export default nextConfig;
