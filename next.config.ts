import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".inkflow-next",
  allowedDevOrigins: ["192.168.1.185"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
