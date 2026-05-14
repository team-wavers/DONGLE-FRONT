"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form";
import { submitClubRegisterAction } from "./club-register.action";
import type { ClubRegisterFormValues } from "./club-register.schema";

export function useClubRegisterSubmit(registrationKey: string, form: UseFormReturn<ClubRegisterFormValues>) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit: SubmitHandler<ClubRegisterFormValues> = async (values) => {
        setIsSubmitting(true);
        setFormError(undefined);

        try {
            const result = await submitClubRegisterAction(registrationKey, values);

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError && !result.sessionExpired) {
                    toast.error(result.formError);
                }

                if (result.sessionExpired) {
                    router.push(`/login?expired=true&returnTo=${encodeURIComponent(`/club-register/${registrationKey}`)}`);
                }

                return;
            }

            if (result.data) {
                const encoded = btoa(
                    JSON.stringify({
                        tempId: result.data.tempId,
                        tempPassword: result.data.tempPassword,
                        clubName: result.data.clubName,
                    })
                );
                router.push(`/club-register/register-success?data=${encoded}`);
                return;
            }

            toast.success(result.message ?? "동아리 등록이 성공적으로 완료되었습니다!");
            router.replace(result.redirectTo ?? "/club-register/register-success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<ClubRegisterFormValues> = () => {
        toast.error("모든 항목을 작성해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    };
}
