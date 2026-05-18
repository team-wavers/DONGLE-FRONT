"use client";

import { useState } from "react";
import type { SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/form";
import { submitUserCreateAction, submitUserEditAction } from "./user-form.action";
import type { UserCreateFormValues, UserEditFormValues } from "./user-form.schema";

export function useUserCreateSubmit({
    form,
    onSuccess,
}: {
    form: UseFormReturn<UserCreateFormValues>;
    onSuccess: () => void;
}) {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit: SubmitHandler<UserCreateFormValues> = async (values) => {
        setIsSubmitting(true);
        setFormError(undefined);

        try {
            const result = await submitUserCreateAction(values);

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            toast.success(result.message ?? "관리자가 성공적으로 생성되었습니다.");
            onSuccess();
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<UserCreateFormValues> = () => {
        toast.error("관리자 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    };
}

export function useUserEditSubmit({
    form,
    userId,
    originalValues,
    onSuccess,
}: {
    form: UseFormReturn<UserEditFormValues>;
    userId: number;
    originalValues: UserEditFormValues;
    onSuccess: (values: UserEditFormValues) => void;
}) {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit: SubmitHandler<UserEditFormValues> = async (values) => {
        setIsSubmitting(true);
        setFormError(undefined);

        try {
            const result = await submitUserEditAction({
                userId,
                values,
                originalValues,
            });

            if (!result.ok) {
                applyServerFieldErrors(form, result.fieldErrors);
                setFormError(result.formError);

                if (result.formError) {
                    toast.error(result.formError);
                }

                return;
            }

            toast.success(result.message ?? "사용자 정보가 성공적으로 수정되었습니다.");
            onSuccess(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid: SubmitErrorHandler<UserEditFormValues> = () => {
        toast.error("사용자 정보를 다시 확인해주세요.");
    };

    return {
        formError,
        isSubmitting,
        onSubmit,
        onInvalid,
    };
}
