import Link from "next/link";
import { buildPageMetadata } from "@/lib/page-metadata";
import { PRIVACY_PAGE_DESCRIPTION, PRIVACY_PAGE_TITLE } from "@/lib/site";
import { PrivacyPolicy } from "@dongle/content/privacy-policy";

export const metadata = buildPageMetadata({
  title: PRIVACY_PAGE_TITLE,
  description: PRIVACY_PAGE_DESCRIPTION,
  canonicalPath: "/privacy",
});

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
