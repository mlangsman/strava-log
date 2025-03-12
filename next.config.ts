import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net",
      },
    ],
  },

  reactStrictMode: true,
};

export default nextConfig;

module.exports = nextConfig;