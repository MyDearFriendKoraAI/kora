const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kora/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = withPWA(nextConfig);