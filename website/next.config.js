/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prefer loading of ES Modules over CommonJS
  experimental: { esmExternals: true },
  reactStrictMode: true,
  swcMinify: true,

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
