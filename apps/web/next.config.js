/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    externalDir: true,
  },
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@cinaseek/web-shared"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
