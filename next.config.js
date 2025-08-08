// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/naver-map/:path*",
        destination: `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
