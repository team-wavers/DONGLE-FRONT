"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Club } from "@dongle/types/club/club.d";
import { clubFormAction, updateClubPresidentAction } from "@/feature/club/action/club-form.action";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import {
    ClubActivityInfo,
    ClubBasicInfo,
    ClubContactInfo,
    ClubFormActions,
    ClubIntroduction,
    ClubMemberManagement,
} from "../@club";
import ClubDeleteButton from "../club-delete-button";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useSessionExpiredRedirect } from "@/hooks/use-session-expired-redirect";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export interface ClubFormProps {
    club: Club;
    clubId: string;
    presidentId: number;
}

interface ClubMainDraft {
    clubName: string;
    recruitmentStatus: string;
    category: string;
    location: string;
    iconUrls: string[];
    removedIconUrls: string[];
    description: string;
    mainActivities: string;
    tags: string;
    recruitmentStartDate?: string;
    recruitmentEndDate?: string;
    instagram: string;
    youtube: string;
}

interface ClubPresidentDraft {
    presidentName: string;
    presidentContact: string;
}

const UNSAVED_CHANGES_MESSAGE = "작성 중인 동아리 정보가 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function createInitialMainDraft(club: Club): ClubMainDraft {
    return {
        clubName: club.name ?? "",
        recruitmentStatus: club.is_recruiting ? RECRUITMENT_STATUS.RECRUITING : RECRUITMENT_STATUS.CLOSED,
        category: club.category ?? "",
        location: club.location ?? "",
        iconUrls: club.icon_url ? [club.icon_url] : [],
        removedIconUrls: [],
        description: club.description ?? "",
        mainActivities: club.main_activities ?? "",
        tags: club.tags.join(", "),
        recruitmentStartDate: club.recruit_start ?? undefined,
        recruitmentEndDate: club.recruit_end ?? undefined,
        instagram: club.sns?.instagram ?? "",
        youtube: club.sns?.youtube ?? "",
    };
}

function createInitialPresidentDraft(club: Club): ClubPresidentDraft {
    return {
        presidentName: club.president?.name ?? "",
        presidentContact: club.president?.phone ?? "",
    };
}

function getMainDraftStorageKey(clubId: string) {
    return `club-edit-draft:${clubId}:main`;
}

function getPresidentDraftStorageKey(clubId: string) {
    return `club-edit-draft:${clubId}:president`;
}

function areEqual<T>(left: T, right: T) {
    return JSON.stringify(left) === JSON.stringify(right);
}

export default function ClubForm({ club, clubId, presidentId }: ClubFormProps) {
    const pathname = usePathname();
    const initialMainDraft = useMemo(() => createInitialMainDraft(club), [club]);
    const initialPresidentDraft = useMemo(() => createInitialPresidentDraft(club), [club]);
    const mainDraftStorageKey = useMemo(() => getMainDraftStorageKey(clubId), [clubId]);
    const presidentDraftStorageKey = useMemo(() => getPresidentDraftStorageKey(clubId), [clubId]);
    const [mainDraft, setMainDraft] = useState<ClubMainDraft>(initialMainDraft);
    const [presidentDraft, setPresidentDraft] = useState<ClubPresidentDraft>(initialPresidentDraft);
    const [didRestoreMainDraft, setDidRestoreMainDraft] = useState(false);
    const [didRestorePresidentDraft, setDidRestorePresidentDraft] = useState(false);

    const [state, formAction, isPending] = useActionState(clubFormAction, {
        success: false,
        error: undefined,
        sessionExpired: false,
        fieldErrors: undefined,
    });
    const [presidentState, presidentFormAction, isPresidentPending] = useActionState(updateClubPresidentAction, {
        success: false,
        error: undefined,
        sessionExpired: false,
        fieldErrors: undefined,
    });

    const isMainDirty = !areEqual(mainDraft, initialMainDraft);
    const isPresidentDirty = !areEqual(presidentDraft, initialPresidentDraft);

    useSessionStorageDraft<ClubMainDraft>({
        key: mainDraftStorageKey,
        currentValue: mainDraft,
        baselineValue: initialMainDraft,
        isDirty: isMainDirty,
        success: state.success,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            setMainDraft(savedDraft);
            setDidRestoreMainDraft(true);
            toast.success("임시 저장된 동아리 정보를 복구했습니다.");
        },
    });

    useSessionStorageDraft<ClubPresidentDraft>({
        key: presidentDraftStorageKey,
        currentValue: presidentDraft,
        baselineValue: initialPresidentDraft,
        isDirty: isPresidentDirty,
        success: presidentState.success,
        shouldRestore: (savedDraft, baseDraft) => !areEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            setPresidentDraft(savedDraft);
            setDidRestorePresidentDraft(true);
            toast.success("임시 저장된 회장 정보를 복구했습니다.");
        },
    });

    useUnsavedChangesGuard({
        isDirty: isMainDirty || isPresidentDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useSessionExpiredRedirect({
        sessionExpired: state.sessionExpired || presidentState.sessionExpired,
        returnTo: pathname,
        drafts: [
            {
                isDirty: isMainDirty,
                save: () => {
                    if (typeof window === "undefined") {
                        return;
                    }
                    window.sessionStorage.setItem(mainDraftStorageKey, JSON.stringify(mainDraft));
                },
            },
            {
                isDirty: isPresidentDirty,
                save: () => {
                    if (typeof window === "undefined") {
                        return;
                    }
                    window.sessionStorage.setItem(presidentDraftStorageKey, JSON.stringify(presidentDraft));
                },
            },
        ],
    });

    useEffect(() => {
        if (state.success) {
            toast.success("동아리 정보가 성공적으로 수정되었습니다!");
        }
        if (state.error && !state.sessionExpired) {
            toast.error(state.error);
        }
    }, [state]);

    useEffect(() => {
        if (presidentState.success) {
            toast.success("회장 정보가 성공적으로 수정되었습니다!");
        }
        if (presidentState.error && !presidentState.sessionExpired) {
            toast.error(presidentState.error);
        }
    }, [presidentState]);

    const recruitmentStartDate = mainDraft.recruitmentStartDate ? new Date(mainDraft.recruitmentStartDate) : undefined;
    const recruitmentEndDate = mainDraft.recruitmentEndDate ? new Date(mainDraft.recruitmentEndDate) : undefined;

    return (
        <div className="flex w-full max-w-full min-w-2xs flex-col gap-6">
            <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="clubId" value={clubId} />

                {didRestoreMainDraft ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        임시 저장된 동아리 정보를 복구했습니다. 새로 선택했던 아이콘 파일은 자동 복구되지 않아 다시 선택해야 할 수
                        있습니다.
                    </div>
                ) : null}

                <ClubBasicInfo
                    club={club}
                    values={{
                        clubName: mainDraft.clubName,
                        recruitmentStatus: mainDraft.recruitmentStatus,
                        category: mainDraft.category,
                        location: mainDraft.location,
                        iconUrls: mainDraft.iconUrls,
                    }}
                    onClubNameChange={(value) => setMainDraft((prev) => ({ ...prev, clubName: value }))}
                    onRecruitmentStatusChange={(value) => setMainDraft((prev) => ({ ...prev, recruitmentStatus: value }))}
                    onCategoryChange={(value) => setMainDraft((prev) => ({ ...prev, category: value }))}
                    onLocationChange={(value) => setMainDraft((prev) => ({ ...prev, location: value }))}
                    onIconUrlRemove={(url) =>
                        setMainDraft((prev) => ({
                            ...prev,
                            iconUrls: prev.iconUrls.filter((item) => item !== url),
                            removedIconUrls: prev.removedIconUrls.includes(url)
                                ? prev.removedIconUrls
                                : [...prev.removedIconUrls, url],
                        }))
                    }
                    onReplaceExistingIconUrls={() =>
                        setMainDraft((prev) => ({
                            ...prev,
                            removedIconUrls: [...new Set([...prev.removedIconUrls, ...prev.iconUrls])],
                            iconUrls: [],
                        }))
                    }
                    fieldErrors={{
                        clubName: state.fieldErrors?.clubName,
                        recruitmentStatus: state.fieldErrors?.recruitmentStatus,
                        category: state.fieldErrors?.category,
                        location: state.fieldErrors?.location,
                        icon: state.fieldErrors?.icon,
                    }}
                />

                <ClubIntroduction
                    club={club}
                    values={{
                        description: mainDraft.description,
                        mainActivities: mainDraft.mainActivities,
                        tags: mainDraft.tags,
                    }}
                    onDescriptionChange={(value) => setMainDraft((prev) => ({ ...prev, description: value }))}
                    onMainActivitiesChange={(value) => setMainDraft((prev) => ({ ...prev, mainActivities: value }))}
                    onTagsChange={(value) => setMainDraft((prev) => ({ ...prev, tags: value }))}
                    fieldErrors={{
                        description: state.fieldErrors?.description,
                        main_activities: state.fieldErrors?.main_activities,
                    }}
                />

                <ClubActivityInfo
                    club={club}
                    values={{
                        recruitmentStartDate,
                        recruitmentEndDate,
                    }}
                    onRecruitmentStartDateChange={(date) =>
                        setMainDraft((prev) => ({ ...prev, recruitmentStartDate: date ? date.toISOString() : undefined }))
                    }
                    onRecruitmentEndDateChange={(date) =>
                        setMainDraft((prev) => ({ ...prev, recruitmentEndDate: date ? date.toISOString() : undefined }))
                    }
                    fieldErrors={{
                        recruitmentStartDate: state.fieldErrors?.recruitmentStartDate,
                        recruitmentEndDate: state.fieldErrors?.recruitmentEndDate,
                    }}
                />

                <ClubContactInfo
                    club={club}
                    values={{
                        instagram: mainDraft.instagram,
                        youtube: mainDraft.youtube,
                    }}
                    onInstagramChange={(value) => setMainDraft((prev) => ({ ...prev, instagram: value }))}
                    onYoutubeChange={(value) => setMainDraft((prev) => ({ ...prev, youtube: value }))}
                />

                <ClubFormActions
                    isPending={isPending}
                    buttonText="동아리 정보 수정"
                    loadingText="수정 중..."
                    secondaryAction={club ? <ClubDeleteButton clubId={Number(clubId)} clubName={club.name} /> : null}
                />
            </form>

            <form action={presidentFormAction} className="flex flex-col gap-4">
                <input type="hidden" name="clubId" value={clubId} />
                <input type="hidden" name="presidentId" value={presidentId} />

                {didRestorePresidentDraft ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        임시 저장된 회장 정보를 복구했습니다.
                    </div>
                ) : null}

                <ClubMemberManagement
                    club={club}
                    values={presidentDraft}
                    onPresidentNameChange={(value) => setPresidentDraft((prev) => ({ ...prev, presidentName: value }))}
                    onPresidentContactChange={(value) =>
                        setPresidentDraft((prev) => ({ ...prev, presidentContact: value }))
                    }
                    fieldErrors={{
                        presidentName: presidentState.fieldErrors?.presidentName,
                        presidentContact: presidentState.fieldErrors?.presidentContact,
                    }}
                />

                <ClubFormActions isPending={isPresidentPending} buttonText="회장 정보 수정" loadingText="수정 중..." />
            </form>
        </div>
    );
}
