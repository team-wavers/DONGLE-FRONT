"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { clubFormAction, updateClubPresidentAction } from "@/feature/club/action/club-form.action";
import { Club } from "@dongle/types/club/club.d";

import {
    ClubBasicInfo,
    ClubIntroduction,
    ClubMemberManagement,
    ClubActivityInfo,
    ClubContactInfo,
    ClubFormActions,
} from "../@club";
import ClubDeleteButton from "../club-delete-button";

export interface ClubFormProps {
    club: Club;
    clubId: string;
    presidentId: number;
}

export default function ClubForm({ club, clubId, presidentId }: ClubFormProps) {
    const [state, formAction, isPending] = useActionState(clubFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });
    const [presidentState, presidentFormAction, isPresidentPending] = useActionState(updateClubPresidentAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

    // 성공/실패 시 토스트 표시
    useEffect(() => {
        if (state.fieldErrors && Object.keys(state.fieldErrors).length > 0) {
            toast.error("모든 항목을 입력해주세요.");
        }
        if (state.success) {
            toast.success("동아리 정보가 성공적으로 수정되었습니다!");
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    useEffect(() => {
        if (presidentState.fieldErrors && Object.keys(presidentState.fieldErrors).length > 0) {
            toast.error("회장 정보를 다시 확인해주세요.");
        }
        if (presidentState.success) {
            toast.success("회장 정보가 성공적으로 수정되었습니다!");
        }
        if (presidentState.error) {
            toast.error(presidentState.error);
        }
    }, [presidentState]);

    return (
        <div className="flex w-full max-w-full min-w-2xs flex-col gap-6">
            <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="clubId" value={clubId} />

                <ClubBasicInfo
                    club={club}
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
                    fieldErrors={{
                        description: state.fieldErrors?.description,
                        main_activities: state.fieldErrors?.main_activities,
                    }}
                />

                <ClubActivityInfo
                    club={club}
                    fieldErrors={{
                        recruitmentStartDate: state.fieldErrors?.recruitmentStartDate,
                        recruitmentEndDate: state.fieldErrors?.recruitmentEndDate,
                    }}
                />

                <ClubContactInfo club={club} />

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

                <ClubMemberManagement
                    club={club}
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
