"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { clubRegisterFormAction } from "@/feature/club/action/club-form.action";
import { RECRUITMENT_STATUS } from "@/feature/club/constants/club.constants";
import {
    ClubActivityInfo,
    ClubBasicInfo,
    ClubContactInfo,
    ClubFormActions,
    ClubIntroduction,
    ClubMemberManagement,
} from "../@club";
import { useSessionStorageDraft } from "@/hooks/use-session-storage-draft";
import { useSessionExpiredRedirect } from "@/hooks/use-session-expired-redirect";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

export interface ClubRegisterFormProps {
    registrationKey: string;
}

interface ClubRegisterDraft {
    clubName: string;
    recruitmentStatus: string;
    category: string;
    location: string;
    description: string;
    mainActivities: string;
    tags: string;
    recruitmentStartDate?: string;
    recruitmentEndDate?: string;
    instagram: string;
    youtube: string;
    presidentName: string;
    presidentContact: string;
}

const DEFAULT_RECRUITMENT_STATUS = RECRUITMENT_STATUS.CLOSED;
const UNSAVED_CHANGES_MESSAGE = "작성 중인 동아리 등록 내용이 저장되지 않았습니다. 정말 페이지를 떠날까요?";

function createInitialDraft(): ClubRegisterDraft {
    return {
        clubName: "",
        recruitmentStatus: DEFAULT_RECRUITMENT_STATUS,
        category: "",
        location: "",
        description: "",
        mainActivities: "",
        tags: "",
        recruitmentStartDate: undefined,
        recruitmentEndDate: undefined,
        instagram: "",
        youtube: "",
        presidentName: "",
        presidentContact: "",
    };
}

function getDraftStorageKey(registrationKey: string) {
    return `club-register-draft:${registrationKey}`;
}

function areDraftsEqual(left: ClubRegisterDraft, right: ClubRegisterDraft) {
    return JSON.stringify(left) === JSON.stringify(right);
}

export default function ClubRegisterForm({ registrationKey }: ClubRegisterFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const initialDraft = useMemo(() => createInitialDraft(), []);
    const draftStorageKey = useMemo(() => getDraftStorageKey(registrationKey), [registrationKey]);
    const [draft, setDraft] = useState<ClubRegisterDraft>(initialDraft);
    const [didRestoreDraft, setDidRestoreDraft] = useState(false);
    const [state, formAction, isPending] = useActionState(clubRegisterFormAction, {
        success: false,
        error: undefined,
        sessionExpired: false,
        fieldErrors: undefined,
    });
    const isDirty = !areDraftsEqual(draft, initialDraft);

    useSessionStorageDraft<ClubRegisterDraft>({
        key: draftStorageKey,
        currentValue: draft,
        baselineValue: initialDraft,
        isDirty,
        success: state.success,
        shouldRestore: (savedDraft, baseDraft) => !areDraftsEqual(savedDraft, baseDraft),
        onRestore: (savedDraft) => {
            setDraft(savedDraft);
            setDidRestoreDraft(true);
            toast.success("임시 저장된 동아리 등록 내용을 복구했습니다.");
        },
    });

    useUnsavedChangesGuard({
        isDirty,
        message: UNSAVED_CHANGES_MESSAGE,
    });

    useSessionExpiredRedirect({
        sessionExpired: state.sessionExpired,
        returnTo: pathname,
        drafts: [
            {
                isDirty,
                save: () => {
                    if (typeof window === "undefined") {
                        return;
                    }
                    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
                },
            },
        ],
    });

    useEffect(() => {
        if (state.success && state.tempId && state.tempPassword) {
            const successData = {
                tempId: state.tempId,
                tempPassword: state.tempPassword,
                clubName: state.clubName,
                warningMessage: state.warningMessage,
            };
            const encoded = btoa(JSON.stringify(successData));
            router.push(`/club-register/register-success?data=${encoded}`);
        } else if (state.success) {
            toast.success("동아리 등록이 성공적으로 완료되었습니다!");
            router.replace("/club-register/register-success");
        }

        if (state.error && !state.sessionExpired) {
            toast.error(state.error);
        }
    }, [router, state]);

    const recruitmentStartDate = draft.recruitmentStartDate ? new Date(draft.recruitmentStartDate) : undefined;
    const recruitmentEndDate = draft.recruitmentEndDate ? new Date(draft.recruitmentEndDate) : undefined;

    return (
        <form action={formAction} className="flex max-w-3xl flex-col gap-4 min-w-2xs w-full">
            <input type="hidden" name="registrationKey" value={registrationKey} />

            {didRestoreDraft ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    임시 저장된 동아리 등록 내용을 복구했습니다. 새로 선택했던 이미지 파일은 자동 복구되지 않아 다시 선택해야 할 수
                    있습니다.
                </div>
            ) : null}

            <ClubBasicInfo
                values={{
                    clubName: draft.clubName,
                    recruitmentStatus: draft.recruitmentStatus,
                    category: draft.category,
                    location: draft.location,
                    iconUrls: [],
                }}
                onClubNameChange={(value) => setDraft((prev) => ({ ...prev, clubName: value }))}
                onRecruitmentStatusChange={(value) => setDraft((prev) => ({ ...prev, recruitmentStatus: value }))}
                onCategoryChange={(value) => setDraft((prev) => ({ ...prev, category: value }))}
                onLocationChange={(value) => setDraft((prev) => ({ ...prev, location: value }))}
                fieldErrors={{
                    clubName: state.fieldErrors?.clubName,
                    recruitmentStatus: state.fieldErrors?.recruitmentStatus,
                    category: state.fieldErrors?.category,
                    location: state.fieldErrors?.location,
                }}
            />

            <ClubIntroduction
                values={{
                    description: draft.description,
                    mainActivities: draft.mainActivities,
                    tags: draft.tags,
                }}
                onDescriptionChange={(value) => setDraft((prev) => ({ ...prev, description: value }))}
                onMainActivitiesChange={(value) => setDraft((prev) => ({ ...prev, mainActivities: value }))}
                onTagsChange={(value) => setDraft((prev) => ({ ...prev, tags: value }))}
                fieldErrors={{
                    description: state.fieldErrors?.description,
                    main_activities: state.fieldErrors?.main_activities,
                }}
            />

            <ClubMemberManagement
                values={{
                    presidentName: draft.presidentName,
                    presidentContact: draft.presidentContact,
                }}
                onPresidentNameChange={(value) => setDraft((prev) => ({ ...prev, presidentName: value }))}
                onPresidentContactChange={(value) => setDraft((prev) => ({ ...prev, presidentContact: value }))}
                fieldErrors={{
                    presidentName: state.fieldErrors?.presidentName,
                    presidentContact: state.fieldErrors?.presidentContact,
                }}
            />

            <ClubActivityInfo
                values={{
                    recruitmentStartDate,
                    recruitmentEndDate,
                }}
                onRecruitmentStartDateChange={(date) =>
                    setDraft((prev) => ({ ...prev, recruitmentStartDate: date ? date.toISOString() : undefined }))
                }
                onRecruitmentEndDateChange={(date) =>
                    setDraft((prev) => ({ ...prev, recruitmentEndDate: date ? date.toISOString() : undefined }))
                }
                fieldErrors={{
                    recruitmentStartDate: state.fieldErrors?.recruitmentStartDate,
                    recruitmentEndDate: state.fieldErrors?.recruitmentEndDate,
                }}
            />

            <ClubContactInfo
                values={{
                    instagram: draft.instagram,
                    youtube: draft.youtube,
                }}
                onInstagramChange={(value) => setDraft((prev) => ({ ...prev, instagram: value }))}
                onYoutubeChange={(value) => setDraft((prev) => ({ ...prev, youtube: value }))}
            />

            <ClubFormActions isPending={isPending} buttonText="동아리 등록" loadingText="등록 중..." />
        </form>
    );
}
