import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.185"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
