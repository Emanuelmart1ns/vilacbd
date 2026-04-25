import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Frontend-Backend Mismatches
  // Automatically sync client and server versions to avoid deployment conflicts
  experimental: {
    // Enable strict mode for better error detection
    strictNextHead: true,
  },
  
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
