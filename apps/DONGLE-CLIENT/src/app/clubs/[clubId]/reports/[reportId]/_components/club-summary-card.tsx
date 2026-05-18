import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import type { Club } from "@dongle/types/club/club";
import { cn } from "@dongle/ui/utils";
import Image from "next/image";
import Link from "next/link";

type ClubSummary = Pick<Club, "id" | "name" | "icon_url" | "category" | "tags">;

interface ClubSummaryCardProps {
    club: ClubSummary;
}

export default function ClubSummaryCard({ club }: ClubSummaryCardProps) {
    const presentation = getClubCategoryPresentation(club.category);
    const Icon = presentation.icon;
    const displayTags = club.tags.length > 0 ? club.tags.slice(0, 3) : [club.category];

    return (
        <Link
            href={`/clubs/${club.id}`}
            className="group flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50/50">
            <div
                className={cn(
                    "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border",
                    presentation.iconClassName,
                    "bg-white"
                )}>
                {club.icon_url ? (
                    <Image src={club.icon_url} alt={`${club.name} 아이콘`} fill sizes="48px" className="object-cover" />
                ) : (
                    <Icon className="size-6" aria-hidden="true" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="truncate font-bold text-zinc-950">{club.name}</h2>
                    <span
                        className={cn("rounded-md border px-2 py-0.5 text-xs font-bold", presentation.labelClassName)}>
                        {club.category}
                    </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {displayTags.map((tag) => (
                        <span
                            key={tag}
                            className="max-w-full truncate rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
