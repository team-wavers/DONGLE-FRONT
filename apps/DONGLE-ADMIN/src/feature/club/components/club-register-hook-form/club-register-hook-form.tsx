"use client";

import { useClubRegisterForm } from "@/feature/club/hooks/use-club-register-form";

import { ClubBasicInfoHookForm } from "../@club-hook-form/club-basic-info-hook-form";
import { ClubIntroductionHookForm } from "../@club-hook-form/club-introduction-hook-form";
import { ClubMemberManagementHookForm } from "../@club-hook-form/club-member-management-hook-form";
import { ClubActivityInfoHookForm } from "../@club-hook-form/club-activity-info-hook-form";
import { ClubContactInfoHookForm } from "../@club-hook-form/club-contact-info-hook-form";
import { LoadingButton } from "@/components/atoms/button/loading-button/loading-button";

export interface ClubRegisterHookFormProps {
    registrationKey: string;
}

export default function ClubRegisterHookForm({ registrationKey }: ClubRegisterHookFormProps) {
    const { form, onSubmit, isSubmitting } = useClubRegisterForm(registrationKey);

    const {
        register,
        control,
        setValue,
        watch,
        formState: { errors },
    } = form;

    return (
        <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-4 min-w-2xs w-full">
            <ClubBasicInfoHookForm
                register={register}
                control={control}
                setValue={setValue}
                watch={watch}
                errors={errors}
            />

            <ClubIntroductionHookForm register={register} errors={errors} />

            <ClubMemberManagementHookForm register={register} errors={errors} />

            <ClubActivityInfoHookForm
                register={register}
                control={control}
                setValue={setValue}
                watch={watch}
                errors={errors}
            />

            <ClubContactInfoHookForm register={register} errors={errors} />

            <div className="flex justify-end gap-4 pt-6">
                <LoadingButton
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white"
                    loading={isSubmitting}
                    loadingText="등록 중...">
                    동아리 등록
                </LoadingButton>
            </div>
        </form>
    );
}
