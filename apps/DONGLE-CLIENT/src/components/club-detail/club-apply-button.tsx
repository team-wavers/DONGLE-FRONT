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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            지원하기
            <ExternalLink className="size-4" aria-hidden="true" />
        </a>
    );
}
