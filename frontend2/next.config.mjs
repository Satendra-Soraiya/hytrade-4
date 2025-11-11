/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production'
    const API_TARGET = process.env.NEXT_PUBLIC_API_URL || (isProd ? 'https://hytrade-backend.onrender.com' : 'http://localhost:3002')
    // If API URL is absolute localhost, still proxy via Next to avoid browser restrictions
    // This allows the app to call same-origin `/api/*` during dev.
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ]
  },
  async headers() {
    // Stop edge/CDN from caching HTML for critical routes to avoid stale content
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/login',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig