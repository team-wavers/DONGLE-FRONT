"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Instagram, Youtube } from "lucide-react";
import { trackDongleEvent } from "@/lib/analytics";

interface ClubDetailSocialInfoLinkProps {
    clubId: number;
    clubName: string;
    platform: "instagram" | "youtube";
    href: string;
    label: string;
    value: string;
}

const PLATFORM_ICON = {
    instagram: Instagram,
    youtube: Youtube,
} as const;

export default function ClubDetailSocialInfoLink({
    clubId,
    clubName,
    platform,
    href,
    label,
    value,
}: ClubDetailSocialInfoLinkProps) {
    const Icon = PLATFORM_ICON[platform];

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
                trackDongleEvent("social_link_click", {
                    club_id: clubId,
                    club_name: clubName,
                    platform,
                    destination: href,
                })
            }
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50">
            <Icon className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
            <dt className="w-20 shrink-0 text-sm font-bold text-zinc-400">{label}</dt>
            <dd className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-medium text-zinc-950">
                <span className="truncate">{value}</span>
                <ExternalLink className="size-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
            </dd>
        </Link>
    );
}
