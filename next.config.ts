import { NextConfig } from 'next';

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

export default nextConfig;