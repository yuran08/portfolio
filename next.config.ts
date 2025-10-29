import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: false,
};

export default nextConfig;
