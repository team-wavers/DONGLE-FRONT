import { buildPageMetadata } from "@/lib/page-metadata";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

type ClubMetadataSource = {
    id: number;
    name: string;
    category: string;
    description: string;
    main_activities: string;
    is_recruiting: boolean;
    icon_url: string | null;
};

export function buildClubDescription(club: Pick<ClubMetadataSource, "description" | "main_activities" | "category" | "name" | "is_recruiting">) {
    const rawDescription = club.description?.trim() || club.main_activities?.trim();

    if (rawDescription) {
        return rawDescription.length > 140 ? `${rawDescription.slice(0, 137)}...` : rawDescription;
    }

    const recruitmentLabel = club.is_recruiting ? "현재 모집 중" : "모집 마감";
    return `순천대 ${club.category} 동아리 ${club.name}의 소개, 활동보고서, 일정 정보입니다. ${recruitmentLabel}.`;
}

export function buildClubPageMetadata(club: ClubMetadataSource) {
    const title = club.name;
    const description = buildClubDescription(club);
    const image = club.icon_url || DEFAULT_OG_IMAGE_PATH;
    const canonicalPath = `/clubs/${club.id}`;

    return buildPageMetadata({
        title,
        description,
        canonicalPath,
        openGraphType: "website",
        image,
        imageAlt: `${title} 대표 이미지`,
    });
}

export function buildClubFallbackMetadata(clubId: string, reason: "invalid" | "not_found") {
    const canonicalPath = `/clubs/${clubId}`;

    if (reason === "invalid") {
        return buildPageMetadata({
            title: "동아리를 찾을 수 없음",
            description: "올바르지 않은 동아리 주소입니다. 동글 홈에서 동아리를 다시 검색해 보세요.",
            canonicalPath,
        });
    }

    return buildPageMetadata({
        title: "동아리를 찾을 수 없음",
        description: "요청하신 동아리 정보를 찾을 수 없습니다. 동글 홈에서 다른 동아리를 검색해 보세요.",
        canonicalPath,
    });
}
