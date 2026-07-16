import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".inkflow-next",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
