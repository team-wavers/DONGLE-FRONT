import Logo from "@/shared/components/atoms/logo/logo";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 w-full max-w-sm">
      <Logo type="full" size="md" />
      {children}
    </div>
  );
}
