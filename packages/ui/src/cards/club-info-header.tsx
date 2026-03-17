import { CardHeader, CardTitle } from "./card";
import { Badge } from "../badges/badge";
import { RecruitmentStatusBadge } from "../badges/recruitment-status-badge";
import { cn } from "../utils";

const styles = {
    header: {
        list: "flex flex-row items-center justify-between gap-3 px-6 py-6 w-full",
        default: "flex flex-col gap-3",
    },
    title: {
        base: "text-xl font-bold truncate",
        variant: {
            list: "leading-none text-zinc-700",
            default: "text-zinc-900",
        },
    },
    category: {
        list: "mt-2 text-sm font-bold text-zinc-400",
        default: "w-fit text-sm font-bold",
    },
} as const;

export type ClubInfoHeaderVariant = "default" | "list";

interface ClubInfoHeaderProps {
    name: string;
    category: string;
    isRecruiting: boolean;
    variant?: ClubInfoHeaderVariant;
}

export function ClubInfoHeader({ name, category, isRecruiting, variant = "default" }: ClubInfoHeaderProps) {
    if (variant === "list") {
        return (
            <CardHeader className={styles.header.list}>
                <div className="min-w-0">
                    <CardTitle className={cn(styles.title.base, styles.title.variant.list)}>{name}</CardTitle>
                    <p className={styles.category.list}>{category}</p>
                </div>
                <RecruitmentStatusBadge isRecruiting={isRecruiting} />
            </CardHeader>
        );
    }

    return (
        <CardHeader className={styles.header.default}>
            <CardTitle className={cn(styles.title.base, styles.title.variant.default)}>{name}</CardTitle>
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className={styles.category.default}>
                    {category}
                </Badge>
                <RecruitmentStatusBadge isRecruiting={isRecruiting} />
            </div>
        </CardHeader>
    );
}
