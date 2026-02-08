/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for better compatibility with Render
  output: 'standalone',
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // For static exports compatibility
  images: {
    unoptimized: true,
  },
  
  // Add headers for static files
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Handle CORS for API calls (optional but helpful)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;