"use client";

import Link from "next/link";
import { Youtube } from "lucide-react";
import { trackDongleEvent } from "@/lib/analytics";

export default function ClubSocialLinks({
    clubId,
    clubName,
    instagramUrl,
    youtubeUrl,
    className = "",
}: {
    clubId: number;
    clubName: string;
    instagramUrl: string | null;
    youtubeUrl: string | null;
    className?: string;
}) {
    if (!youtubeUrl) {
        return null;
    }

    return (
        <div className={`flex h-fit flex-wrap gap-2 ${className}`}>
            {youtubeUrl && (
                <Link
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                        trackDongleEvent("social_link_click", {
                            club_id: clubId,
                            club_name: clubName,
                            platform: "youtube",
                            destination: youtubeUrl,
                        })
                    }
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50">
                    <Youtube className="size-4 text-zinc-400" />
                    youtube
                </Link>
            )}
        </div>
    );
}
