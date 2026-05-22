import * as React from "react";
import { Button } from "@dongle/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@dongle/ui/utils";

export interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
    loading?: boolean;
    loadingText?: string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, disabled, className, variant = "default", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                disabled={disabled || loading}
                className={cn("font-bold rounded-md", className)}
                {...props}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? loadingText || "로딩중..." : children}
            </Button>
        );
    }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
