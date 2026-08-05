/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'boam-real-estate.onrender.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Reduce server-side overhead during dev
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;

