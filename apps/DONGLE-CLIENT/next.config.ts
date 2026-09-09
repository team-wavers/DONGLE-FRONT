import path from "path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// 운영 예시가 전체 URL(https://...)로 잘못 채워지는 경우까지 방어적으로 hostname만 남긴다.
function toHostname(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  // isomorphic-dompurify(jsdom)를 서버 웹팩 번들에 넣으면 jsdom이 내부적으로 참조하는
  // default-stylesheet.css 경로가 깨져 ENOENT가 난다. 네이티브 require로 로드하도록 externalize.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  outputFileTracingRoot: path.join(__dirname, "../.."), // 모노레포 루트 → standalone에 워크스페이스 패키지 포함
  transpilePackages: [
    "@dongle/ui",
    "@dongle/api",
    "@dongle/service",
    "@dongle/types",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-dropdown-menu",
    ],
  },
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
              hostname: toHostname(process.env.NEXT_PUBLIC_S3_URL),
              port: "",
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
