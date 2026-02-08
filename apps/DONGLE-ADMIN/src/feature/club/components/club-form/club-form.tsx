"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { clubFormAction } from "@/feature/club/action/club-form.action";
import { Club } from "@dongle/types/club/club.d";

import {
    ClubBasicInfo,
    ClubIntroduction,
    ClubMemberManagement,
    ClubActivityInfo,
    ClubContactInfo,
    ClubFormActions,
} from "../@club";

export interface ClubFormProps {
    club: Club;
    clubId: string;
    presidentId: number;
}

export default function ClubForm({ club, clubId, presidentId }: ClubFormProps) {
    console.log("club", club);
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(clubFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

    // 성공/실패 시 토스트 표시
    useEffect(() => {
        if (state.fieldErrors) {
            toast.error("모든 항목을 입력해주세요.");
        }
        if (state.success) {
            toast.success("동아리 정보가 성공적으로 등록되었습니다!");
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <form action={formAction} className="flex max-w-3xl flex-col gap-4 min-w-2xs w-full">
            <input type="hidden" name="clubId" value={clubId} />
            <input type="hidden" name="presidentId" value={presidentId} />

            <ClubBasicInfo
                club={club}
                fieldErrors={{
                    clubName: state.fieldErrors?.clubName,
                    recruitmentStatus: state.fieldErrors?.recruitmentStatus,
                    category: state.fieldErrors?.category,
                    location: state.fieldErrors?.location,
                }}
            />

            <ClubIntroduction
                club={club}
                fieldErrors={{
                    description: state.fieldErrors?.description,
                    main_activities: state.fieldErrors?.main_activities,
                }}
            />

            <ClubMemberManagement
                club={club}
                fieldErrors={{
                    presidentName: state.fieldErrors?.presidentName,
                    presidentContact: state.fieldErrors?.presidentContact,
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
                buttonText={club ? "동아리 정보 수정" : "동아리 정보 등록"}
                loadingText={club ? "수정 중..." : "등록 중..."}
            />
        </form>
    );
}
