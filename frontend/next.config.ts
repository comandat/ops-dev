import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
    ];
  },
  experimental: {
    proxyClientMaxBodySize: 50 * 1024 * 1024,
  },
};

export default nextConfig;
