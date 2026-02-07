import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@dongle/ui",
    "@dongle/api",
    "@dongle/service",
    "@dongle/types",
  ],
};

export default nextConfig;
