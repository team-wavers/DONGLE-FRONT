import * as React from "react";
import { cn } from "@dongle/ui/utils";

export type StatusType = "recruiting" | "closed";

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  status: StatusType;
  customText?: string;
}

const statusConfig = {
  recruiting: {
    text: "모집중",
    className: "bg-green-500 text-white ",
  },
  closed: {
    text: "모집마감",
    className: "bg-zinc-100 text-zinc-300 ",
  },
};

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, customText, className, ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <span
        ref={ref}
        className={cn(
          "rounded-full px-4 py-3 text-sm font-bold border-none flex items-center ",
          config.className,
          className
        )}
        {...props}
      >
        {customText || config.text}
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
