"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form/server-errors";
import { submitMainBannerCreateAction, submitMainBannerUpdateAction } from "./main-banner-form.action";
import type { MainBannerFormValues } from "./main-banner-form.schema";

interface UseMainBannerSubmitOptions {
    form: UseFormReturn<MainBannerFormValues>;
    bannerId?: number;
    successMessage: string;
    onLoadingChange?: (state: { loading: boolean; loadingText: string }) => void;
    loadingText: string;
}

export function useMainBannerSubmit({
    form,
    bannerId,
    successMessage,
    onLoadingChange,
    loadingText,
}: UseMainBannerSubmitOptions) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setSubmitting = (nextSubmitting: boolean) => {
        setIsSubmitting(nextSubmitting);
        onLoadingChange?.({
            loading: nextSubmitting,
            loadingText,
        });
    };

    const onSubmit: SubmitHandler<MainBannerFormValues> = async (values) => {
        setSubmitting(true);
        setFormError(undefined);

        try {
            const result =
                bannerId === undefined
                    ? await submitMainBannerCreateAction(values)
                    : await submitMainBannerUpdateAction({ bannerId, values });

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            toast.success(result.message ?? successMessage);
            router.push(result.redirectTo ?? "/admin/banner");
        } finally {
            setSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<MainBannerFormValues> = () => {
        toast.error("배너 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    };
}
