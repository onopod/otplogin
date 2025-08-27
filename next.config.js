/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes will proxy to our existing server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

export default nextConfig