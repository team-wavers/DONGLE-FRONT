import * as React from "react";
import { Card, CardFooter } from "./card";
import { ClubInfoHeader } from "./club-info-header";
import { cn } from "../utils";

const styles = {
    card: {
        base: "w-full",
        clickable: "cursor-pointer",
        variant: {
            list: "rounded-2xl border-zinc-200 bg-white py-0 shadow-none",
            default: "transition-shadow duration-200 hover:shadow-md gap-1",
        },
    },
} as const;

export type ClubInfoCardVariant = "default" | "list";

interface ClubInfoCardProps {
    name: string;
    category: string;
    isRecruiting: boolean;
    variant?: ClubInfoCardVariant;
    className?: string;
    onClick?: () => void;
    footer?: React.ReactNode;
    footerClassName?: string;
}

export function ClubInfoCard({
    name,
    category,
    isRecruiting,
    variant = "default",
    className,
    onClick,
    footer,
    footerClassName,
}: ClubInfoCardProps) {
    return (
        <Card
            className={cn(styles.card.base, onClick && styles.card.clickable, styles.card.variant[variant], className)}
            onClick={onClick}>
            <ClubInfoHeader name={name} category={category} isRecruiting={isRecruiting} variant={variant} />
            {footer && <CardFooter className={cn("pt-0", footerClassName)}>{footer}</CardFooter>}
        </Card>
    );
}
