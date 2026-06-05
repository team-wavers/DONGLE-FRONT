import { ReactNode } from "react";
import { cn } from "../utils";

interface AppHeaderProps {
    center: ReactNode;
    left?: ReactNode;
    right?: ReactNode;
    className?: string;
    contentClassName?: string;
    leftClassName?: string;
    centerClassName?: string;
    rightClassName?: string;
}

export function AppHeader({
    center,
    left,
    right,
    className,
    contentClassName,
    leftClassName,
    centerClassName,
    rightClassName,
}: AppHeaderProps) {
    return (
        <header className={cn("sticky top-0 z-10 w-full border-b border-zinc-200 bg-white", className)}>
            <div className={cn("relative flex items-center w-full h-16", contentClassName)}>
                {left && (
                    <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 z-20", leftClassName)}>{left}</div>
                )}
                <div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", centerClassName)}>
                    {center}
                </div>
                {right && (
                    <div className={cn("absolute right-3 top-1/2 -translate-y-1/2 z-20", rightClassName)}>
                        {right}
                    </div>
                )}
            </div>
        </header>
    );
}
