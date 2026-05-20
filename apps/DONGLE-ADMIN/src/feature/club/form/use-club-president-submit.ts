"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form/server-errors";
import { submitClubPresidentAction } from "./club-president.action";
import type { ClubPresidentFormValues } from "./club-president.schema";

interface UseClubPresidentSubmitOptions {
    clubId: string;
    presidentId: number;
    form: UseFormReturn<ClubPresidentFormValues>;
    returnTo: string;
    onSuccess?: (values: ClubPresidentFormValues) => void;
    onSessionExpired?: () => void;
}

export function useClubPresidentSubmit({
    clubId,
    presidentId,
    form,
    returnTo,
    onSuccess,
    onSessionExpired,
}: UseClubPresidentSubmitOptions) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSucceeded, setSubmitSucceeded] = useState(false);

    const onSubmit: SubmitHandler<ClubPresidentFormValues> = async (values) => {
        setIsSubmitting(true);
        setSubmitSucceeded(false);
        setFormError(undefined);

        try {
            const result = await submitClubPresidentAction({
                clubId,
                presidentId,
                values,
            });

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.sessionExpired) {
                    onSessionExpired?.();
                    router.replace(`/login?expired=true&returnTo=${encodeURIComponent(returnTo)}`);
                    return;
                }

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            setSubmitSucceeded(true);
            onSuccess?.(values);
            toast.success(result.message ?? "회장 정보가 성공적으로 수정되었습니다!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<ClubPresidentFormValues> = () => {
        toast.error("회장 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
        submitSucceeded,
    };
}
