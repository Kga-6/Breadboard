import type { NextConfig } from 'next';

import withBundleAnalyzer from '@next/bundle-analyzer';

// Create the bundle analyzer instance
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Your existing patterns
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // --- Add these new patterns ---
      // For live Firebase Storage
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // For the Firebase Local Emulator
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9199',
      },
    ],
  },
};

export default bundleAnalyzer(nextConfig);