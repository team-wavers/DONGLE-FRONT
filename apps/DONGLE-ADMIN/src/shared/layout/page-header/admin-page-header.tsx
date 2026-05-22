import type { ReactNode } from "react";

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 w-full mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-3">
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
