import { cn } from "@dongle/ui/utils";
import Image from "next/image";

export default function Logo({
  type = "full",
  className,
  size = "md",
}: {
  type?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeConfig = {
    sm: 100,
    md: 200,
    lg: 300,
  };
  return (
    <div className={cn(className)}>
      <Image
        src={`/logo/logo-${type}.svg`}
        alt="logo"
        width={sizeConfig[size]}
        height={sizeConfig[size]}
        priority
      />
    </div>
  );
}
