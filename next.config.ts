import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    // Images are same-origin only (watermarked previews + gated downloads).
    value: "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data:; connect-src 'self'",
  },
];

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
