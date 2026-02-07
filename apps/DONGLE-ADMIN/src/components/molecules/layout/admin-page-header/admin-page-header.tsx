interface AdminPageHeaderProps {
    title: string;
    description?: string;
}

export default function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 w-full mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
    );
}
