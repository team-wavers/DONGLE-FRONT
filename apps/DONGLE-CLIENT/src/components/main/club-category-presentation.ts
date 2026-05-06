import type { LucideIcon } from "lucide-react";
import { BookOpen, CircleDot, Dumbbell, HandHeart, Landmark, Music2, Palette } from "lucide-react";

type ClubCategoryPresentation = {
    icon: LucideIcon;
    labelClassName: string;
    iconClassName: string;
};

const categoryPresentationMap: Record<string, ClubCategoryPresentation> = {
    체육분과: {
        icon: Dumbbell,
        labelClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
        iconClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    음악분과: {
        icon: Music2,
        labelClassName: "border-sky-100 bg-sky-50 text-sky-700",
        iconClassName: "border-sky-100 bg-sky-50 text-sky-700",
    },
    문예분과: {
        icon: Palette,
        labelClassName: "border-rose-100 bg-rose-50 text-rose-700",
        iconClassName: "border-rose-100 bg-rose-50 text-rose-700",
    },
    봉사분과: {
        icon: HandHeart,
        labelClassName: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
        iconClassName: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    },
    학술분과: {
        icon: BookOpen,
        labelClassName: "border-amber-100 bg-amber-50 text-amber-800",
        iconClassName: "border-amber-100 bg-amber-50 text-amber-800",
    },
    종교분과: {
        icon: Landmark,
        labelClassName: "border-violet-100 bg-violet-50 text-violet-700",
        iconClassName: "border-violet-100 bg-violet-50 text-violet-700",
    },
};

export function getClubCategoryPresentation(category: string): ClubCategoryPresentation {
    return (
        categoryPresentationMap[category] ?? {
            icon: CircleDot,
            labelClassName: "border-zinc-200 bg-zinc-50 text-zinc-600",
            iconClassName: "border-zinc-200 bg-zinc-50 text-zinc-600",
        }
    );
}
