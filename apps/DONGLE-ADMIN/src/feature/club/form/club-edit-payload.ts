import type { UpdateClubRequest } from "@dongle/types/club/club.response";
import { normalizeSocialUrl } from "@dongle/ui/utils";
import { trimToEmpty, trimToNull } from "@dongle/utils";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import type { ClubEditFormValues } from "./club-edit.schema";
import { splitClubEditTags } from "./club-edit.schema";

export function normalizeClubEditSnsPayload(instagram: string, youtube: string) {
    return {
        instagram: normalizeSocialUrl("instagram", instagram) ?? trimToEmpty(instagram),
        youtube: normalizeSocialUrl("youtube", youtube) ?? trimToEmpty(youtube),
    };
}

export function buildClubEditPayload(values: ClubEditFormValues, iconUrl?: string | null): UpdateClubRequest {
    const isRecruiting = values.recruitmentStatus === RECRUITMENT_STATUS.RECRUITING;
    const payload: UpdateClubRequest = {
        is_recruiting: isRecruiting,
        sns: normalizeClubEditSnsPayload(values.instagram, values.youtube),
    };

    if (values.clubName) {
        payload.name = values.clubName;
    }

    const tags = splitClubEditTags(values.tags);
    if (tags.length > 0) {
        payload.tags = tags;
    }

    if (values.description) {
        payload.description = values.description;
    }

    if (values.main_activities) {
        payload.main_activities = values.main_activities;
    }

    if (values.category) {
        payload.category = values.category;
    }

    if (values.location) {
        payload.location = values.location;
    }

    if (isRecruiting) {
        payload.recruit_start = trimToNull(values.recruitmentStartDate);
        payload.recruit_end = trimToNull(values.recruitmentEndDate);
    } else {
        payload.recruit_start = null;
        payload.recruit_end = null;
    }

    if (iconUrl !== undefined) {
        payload.icon_url = iconUrl;
    }

    return payload;
}
