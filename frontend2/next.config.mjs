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
    const API_TARGET = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
    // If API URL is absolute localhost, still proxy via Next to avoid browser restrictions
    // This allows the app to call same-origin `/api/*` during dev.
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ]
  },
}

export default nextConfig