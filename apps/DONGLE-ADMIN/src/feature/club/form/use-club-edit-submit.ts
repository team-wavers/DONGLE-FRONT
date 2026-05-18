"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form";
import { submitClubEditAction } from "./club-edit.action";
import { createClubEditSavedValues, type ClubEditFormValues } from "./club-edit.schema";

interface UseClubEditSubmitOptions {
    clubId: string;
    form: UseFormReturn<ClubEditFormValues>;
    returnTo: string;
    onSuccess?: (values: ClubEditFormValues) => void;
    onSessionExpired?: () => void;
}

export function useClubEditSubmit({ clubId, form, returnTo, onSuccess, onSessionExpired }: UseClubEditSubmitOptions) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSucceeded, setSubmitSucceeded] = useState(false);

    const onSubmit: SubmitHandler<ClubEditFormValues> = async (values) => {
        setIsSubmitting(true);
        setSubmitSucceeded(false);
        setFormError(undefined);

        try {
            const result = await submitClubEditAction({
                clubId,
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

            const savedValues = createClubEditSavedValues(values, {
                iconUrl: result.data?.iconUrl,
            });
            setSubmitSucceeded(true);
            onSuccess?.(savedValues);
            toast.success(result.message ?? "동아리 정보가 성공적으로 수정되었습니다!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<ClubEditFormValues> = () => {
        toast.error("동아리 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
        submitSucceeded,
    };
}
