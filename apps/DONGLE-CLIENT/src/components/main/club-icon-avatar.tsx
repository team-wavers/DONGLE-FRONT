import { getClubCategoryPresentation } from "@/components/main/club-category-presentation";
import { cn } from "@dongle/ui/utils";
import Image from "next/image";

type ClubIconAvatarSize = "sm" | "lg";

interface ClubIconAvatarProps {
    name: string;
    category: string;
    iconUrl?: string | null;
    size?: ClubIconAvatarSize;
}

const sizeClassNames: Record<ClubIconAvatarSize, { container: string; icon: string; imageSizes: string }> = {
    sm: {
        container: "size-12 rounded-lg",
        icon: "size-6",
        imageSizes: "48px",
    },
    lg: {
        container: "size-20 rounded-lg",
        icon: "size-10",
        imageSizes: "80px",
    },
};

export default function ClubIconAvatar({ name, category, iconUrl, size = "sm" }: ClubIconAvatarProps) {
    const presentation = getClubCategoryPresentation(category);
    const FallbackIcon = presentation.icon;
    const classNames = sizeClassNames[size];

    return (
        <div
            className={cn(
                "relative flex shrink-0 items-center justify-center overflow-hidden border",
                classNames.container,
                iconUrl ? "border-zinc-200 bg-white" : presentation.iconClassName
            )}>
            {iconUrl ? (
                <Image src={iconUrl} alt={`${name} 아이콘`} fill sizes={classNames.imageSizes} className="object-cover" />
            ) : (
                <FallbackIcon className={classNames.icon} aria-hidden="true" />
            )}
        </div>
    );
}
