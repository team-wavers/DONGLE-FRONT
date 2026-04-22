import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyPolicy } from "@dongle/content/privacy-policy";
import { cookies } from "next/headers";
import { decodeJwtToken, isTokenExpired } from "@dongle/api/utils/jwt.util";
import { AUTH_ROLE } from "@dongle/types/auth/auth-role";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 동글 관리자",
  description: "동글 개인정보처리방침",
};

async function getAdminPrivacyReturnLink() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken || isTokenExpired(accessToken)) {
    return {
      href: "/login",
      label: "로그인으로 이동",
    };
  }

  const payload = decodeJwtToken(accessToken);
  const role = payload?.role;
  const clubId =
    typeof payload?.club_id === "string"
      ? payload.club_id
      : typeof payload?.club_id === "number"
        ? String(payload.club_id)
        : null;

  if (role === AUTH_ROLE.ADMIN) {
    return {
      href: "/admin",
      label: "관리자 홈으로 이동",
    };
  }

  if (role === AUTH_ROLE.PRESIDENT && clubId) {
    return {
      href: `/${clubId}/club-form`,
      label: "동아리 관리로 이동",
    };
  }

  return {
    href: "/login",
    label: "로그인으로 이동",
  };
}

export default async function PrivacyPage() {
  const returnLink = await getAdminPrivacyReturnLink();

  return (
    <PrivacyPolicy
      actions={
        <Link
          href={returnLink.href}
          className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
        >
          {returnLink.label}
        </Link>
      }
    />
  );
}
