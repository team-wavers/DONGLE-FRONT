import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@dongle/ui",
    "@dongle/api",
    "@dongle/service",
    "@dongle/types",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      ...(process.env.NEXT_PUBLIC_S3_URL
        ? [
            {
              protocol: "https" as const,
              hostname: process.env.NEXT_PUBLIC_S3_URL,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
