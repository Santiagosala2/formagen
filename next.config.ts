import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT,
  },
};

export default nextConfig;
