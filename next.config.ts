import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photography-app-api.onrender.com',
      },
    ],
  },
};

export default nextConfig;
