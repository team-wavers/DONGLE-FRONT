import Logo from "@/components/atoms/logo/logo";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center w-full bg-zinc-100 py-8 gap-4">
      <Logo type="full" size="sm" />
      <p className="text-sm text-zinc-500">
        Copyright 2025. Donggle. All rights reserved.
      </p>
    </footer>
  );
}
