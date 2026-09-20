/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/aetherline',
  assetPrefix: '/aetherline',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
