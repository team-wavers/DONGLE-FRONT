"use client";

import { ClubInfoCard } from "@dongle/ui/cards/club-info-card";
import { Club } from "@dongle/types/club/club.d";
import { useRouter } from "next/navigation";

export default function ClubEditCardContainer({ club }: { club: Club }) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/admin/club/${club.id}`);
    };

    return (
        <ClubInfoCard name={club.name} category={club.category} isRecruiting={club.is_recruiting} onClick={handleCardClick} />
    );
}
