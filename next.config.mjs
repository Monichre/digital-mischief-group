/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-globe.gl', 'globe.gl'],
}

export default nextConfig
