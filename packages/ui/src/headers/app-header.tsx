import { ReactNode } from "react";
import { cn } from "../utils";

interface AppHeaderProps {
    center: ReactNode;
    left?: ReactNode;
    right?: ReactNode;
    className?: string;
}

export function AppHeader({ center, left, right, className }: AppHeaderProps) {
    return (
        <header className={cn("sticky top-0 z-10 w-full border-b border-zinc-200 bg-white", className)}>
            <div className="relative flex items-center w-full h-16">
                {left && <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20">{left}</div>}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{center}</div>
                {right && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">{right}</div>}
            </div>
        </header>
    );
}
