import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@dongle/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dongle/ui/card";
import { cn } from "@dongle/ui/utils";

interface AdminFormShellProps {
    children: React.ReactNode;
    className?: string;
}

export function AdminFormShell({ children, className }: AdminFormShellProps) {
    return <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-6", className)}>{children}</div>;
}

interface AdminFormSectionProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export function AdminFormSection({
    title,
    description,
    icon,
    children,
    className,
    contentClassName,
}: AdminFormSectionProps) {
    return (
        <Card className={cn("gap-0 rounded-lg py-0 shadow-none", className)}>
            <CardHeader className="border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-zinc-900">
                    {icon}
                    {title}
                </CardTitle>
                {description ? <CardDescription className="text-sm">{description}</CardDescription> : null}
            </CardHeader>
            <CardContent className={cn("space-y-4 px-5 py-5", contentClassName)}>{children}</CardContent>
        </Card>
    );
}

interface AdminFormActionsProps {
    children: React.ReactNode;
    className?: string;
}

export function AdminFormActions({ children, className }: AdminFormActionsProps) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse gap-2 border-t bg-white pt-4 sm:flex-row sm:items-center sm:justify-end",
                "[&_button]:w-full sm:[&_button]:w-auto",
                className
            )}>
            {children}
        </div>
    );
}

interface AdminBackActionProps {
    href?: string;
    label?: string;
    onClick?: () => void;
}

export function AdminBackAction({ href, label = "뒤로가기", onClick }: AdminBackActionProps) {
    if (href) {
        return (
            <div className="flex justify-start">
                <Button asChild variant="outline" size="sm">
                    <Link href={href}>
                        <ArrowLeft className="h-4 w-4" />
                        {label}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <Button type="button" variant="outline" size="sm" onClick={onClick}>
                <ArrowLeft className="h-4 w-4" />
                {label}
            </Button>
        </div>
    );
}
