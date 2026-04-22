import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyPolicy } from "@dongle/content/privacy-policy";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "동글 개인정보처리방침",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <PrivacyPolicy
      actions={
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
        >
          홈으로 이동
        </Link>
      }
    />
  );
}
