import Logo from "@/components/atoms/logo/logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center w-full bg-zinc-100 py-8 gap-4">
      <Logo type="full" size="sm" />
      <div className="flex flex-col items-center gap-2 text-sm text-zinc-500">
        <Link href="/privacy" className="font-medium text-zinc-600 hover:text-zinc-900">
          개인정보처리방침
        </Link>
        <p>Copyright 2025. DONGLE. All rights reserved.</p>
      </div>
    </footer>
  );
}
