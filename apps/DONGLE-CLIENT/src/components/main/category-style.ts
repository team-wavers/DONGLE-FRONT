import { BookOpen, Dumbbell, HandHeart, Mic2, Palette, Shapes } from "lucide-react";

export const categoryStyleMap: Record<
    string,
    {
        icon: typeof Shapes;
        tone: string;
        badge: string;
    }
> = {
    체육분과: {
        icon: Dumbbell,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
        badge: "bg-emerald-500 text-white",
    },
    음악분과: {
        icon: Mic2,
        tone: "bg-sky-50 text-sky-700 border-sky-100",
        badge: "bg-sky-500 text-white",
    },
    문예분과: {
        icon: Palette,
        tone: "bg-rose-50 text-rose-700 border-rose-100",
        badge: "bg-rose-500 text-white",
    },
    봉사분과: {
        icon: HandHeart,
        tone: "bg-teal-50 text-teal-700 border-teal-100",
        badge: "bg-teal-500 text-white",
    },
    학술분과: {
        icon: BookOpen,
        tone: "bg-amber-50 text-amber-800 border-amber-100",
        badge: "bg-amber-500 text-white",
    },
};

export const defaultCategoryStyle = {
    icon: Shapes,
    tone: "bg-zinc-100 text-zinc-600 border-zinc-200",
    badge: "bg-zinc-700 text-white",
};

export const getCategoryStyle = (category: string) => categoryStyleMap[category] ?? defaultCategoryStyle;
