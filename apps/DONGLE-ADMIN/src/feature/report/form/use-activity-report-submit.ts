"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form";
import { submitActivityReportCreateAction, submitActivityReportUpdateAction } from "./activity-report.action";
import type { ActivityReportFormValues } from "./activity-report.schema";

export function useActivityReportSubmit({
    form,
    clubId,
    reportId,
    originalReport,
    successRedirectHref,
    successMessage,
    returnTo,
    onSessionExpired,
}: {
    form: UseFormReturn<ActivityReportFormValues>;
    clubId: string;
    reportId?: string;
    originalReport?: { title: string; content: string; image_urls: string[] };
    successRedirectHref?: string;
    successMessage?: string;
    returnTo: string;
    onSessionExpired?: () => void;
}) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSucceeded, setSubmitSucceeded] = useState(false);

    const onSubmit: SubmitHandler<ActivityReportFormValues> = async (values) => {
        setIsSubmitting(true);
        setSubmitSucceeded(false);
        setFormError(undefined);

        try {
            const result =
                reportId && originalReport
                    ? await submitActivityReportUpdateAction({ clubId, reportId, values, originalReport })
                    : await submitActivityReportCreateAction({ clubId, values });

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
            toast.success(result.message ?? successMessage ?? "활동 보고서가 저장되었습니다.");
            router.push(successRedirectHref ?? `/${clubId}/report`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<ActivityReportFormValues> = () => {
        toast.error("활동보고서 내용을 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
        submitSucceeded,
    };
}
