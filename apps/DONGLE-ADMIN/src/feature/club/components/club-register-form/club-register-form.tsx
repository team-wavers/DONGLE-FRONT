"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { clubRegisterFormAction } from "@/feature/club/action/club-form.action";

import {
    ClubBasicInfo,
    ClubIntroduction,
    ClubMemberManagement,
    ClubActivityInfo,
    ClubContactInfo,
    ClubFormActions,
} from "../@club";

export interface ClubRegisterFormProps {
    registrationKey: string;
}

export default function ClubRegisterForm({ registrationKey }: ClubRegisterFormProps) {
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(clubRegisterFormAction, {
        success: false,
        error: undefined,
        fieldErrors: undefined,
    });

    useEffect(() => {
        if (state.success && state.tempId && state.tempPassword) {
            // 성공 페이지로 데이터와 함께 이동
            const successData = {
                tempId: state.tempId,
                tempPassword: state.tempPassword,
                clubName: state.clubName,
            };
            const encoded = btoa(JSON.stringify(successData));
            router.push(`/club-register/register-success?data=${encoded}`);
        } else if (state.success) {
            toast.success("동아리 등록이 성공적으로 완료되었습니다!");
            router.replace("/club-register/register-success");
        }
        if (state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <form action={formAction} className="flex max-w-3xl flex-col gap-4 min-w-2xs w-full">
            <input type="hidden" name="registrationKey" value={registrationKey} />

            <ClubBasicInfo
                fieldErrors={{
                    clubName: state.fieldErrors?.clubName,
                    recruitmentStatus: state.fieldErrors?.recruitmentStatus,
                    category: state.fieldErrors?.category,
                    location: state.fieldErrors?.location,
                }}
            />

            <ClubIntroduction
                fieldErrors={{
                    description: state.fieldErrors?.description,
                    main_activities: state.fieldErrors?.main_activities,
                }}
            />

            <ClubMemberManagement
                fieldErrors={{
                    presidentName: state.fieldErrors?.presidentName,
                    presidentContact: state.fieldErrors?.presidentContact,
                }}
            />

            <ClubActivityInfo
                fieldErrors={{
                    recruitmentStartDate: state.fieldErrors?.recruitmentStartDate,
                    recruitmentEndDate: state.fieldErrors?.recruitmentEndDate,
                }}
            />

            <ClubContactInfo />

            <ClubFormActions isPending={isPending} buttonText="동아리 등록" loadingText="등록 중..." />
        </form>
    );
}
