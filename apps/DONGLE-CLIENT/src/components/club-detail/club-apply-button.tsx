"use client";

import React from "react";
import { trackDongleEvent } from "@/lib/analytics";
import { ExternalLink } from "lucide-react";

interface ClubApplyButtonProps {
    clubId: number;
    clubName: string;
    applyUrl: string;
}

export default function ClubApplyButton({ clubId, clubName, applyUrl }: ClubApplyButtonProps) {
    return (
        <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
                trackDongleEvent("club_apply_click", {
                    club_id: clubId,
                    club_name: clubName,
                })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 md:w-auto">
            지원하기
            <ExternalLink className="size-4" aria-hidden="true" />
        </a>
    );
}
