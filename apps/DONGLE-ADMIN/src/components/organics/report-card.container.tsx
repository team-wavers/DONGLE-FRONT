"use client";

import Link from "next/link";
import { ClubInfoCard } from "@dongle/ui/cards/club-info-card";
import { Club } from "@dongle/types/club/club.d";

export default function ReportCardContainer({ club }: { club: Club }) {
    return (
        <Link href={`/admin/report/${club.id}`} className="block w-full">
            <ClubInfoCard name={club.name} category={club.category} isRecruiting={club.is_recruiting} />
        </Link>
    );
}
