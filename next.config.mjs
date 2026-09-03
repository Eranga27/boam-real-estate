/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'boam-real-estate.onrender.com' },
      { protocol: 'https', hostname: 'boam-backend.onrender.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Reduce server-side overhead during dev
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async rewrites() {
    const targetBackend = process.env.NEXT_PUBLIC_API_URL || 'https://boam-real-estate.onrender.com';
    const cleanBackend = targetBackend.replace(/\/$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanBackend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
