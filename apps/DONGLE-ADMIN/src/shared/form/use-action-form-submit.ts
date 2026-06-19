"use client";

import { useState } from "react";
import type { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { ActionResult } from "@/shared/action";
import { applyServerFieldErrors } from "./server-errors";

type FormActionResult<TValues extends FieldValues, TData = unknown> = ActionResult<Extract<keyof TValues, string>, TData>;

type SuccessResult<TResult> = Extract<TResult, { ok: true }>;
type FailureResult<TResult> = Extract<TResult, { ok: false }>;

interface RunActionFormSubmitOptions<
    TValues extends FieldValues,
    TResult extends FormActionResult<TValues> = FormActionResult<TValues>,
> {
    form: UseFormReturn<TValues>;
    values: TValues;
    action: (values: TValues) => Promise<TResult>;
    onSuccess: (context: { values: TValues; result: SuccessResult<TResult> }) => void | Promise<void>;
    onFailure?: (context: { result: FailureResult<TResult> }) => void | Promise<void>;
    onSessionExpired?: (context: { result: FailureResult<TResult> }) => void | Promise<void>;
}

interface UseActionFormSubmitOptions<
    TValues extends FieldValues,
    TResult extends FormActionResult<TValues> = FormActionResult<TValues>,
> {
    form: UseFormReturn<TValues>;
    invalidMessage: string;
    action: (values: TValues) => Promise<TResult>;
    onSuccess: (context: { values: TValues; result: SuccessResult<TResult> }) => void | Promise<void>;
    onFailure?: (context: { result: FailureResult<TResult> }) => void | Promise<void>;
    onSessionExpired?: (context: { result: FailureResult<TResult> }) => void | Promise<void>;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}

export async function runActionFormSubmit<
    TValues extends FieldValues,
    TResult extends FormActionResult<TValues> = FormActionResult<TValues>,
>({ form, values, action, onSuccess, onFailure, onSessionExpired }: RunActionFormSubmitOptions<TValues, TResult>) {
    const result = await action(values);

    if (!result.ok) {
        applyServerFieldErrors(form, result.fieldErrors);
        await onFailure?.({ result: result as FailureResult<TResult> });

        if (result.sessionExpired && onSessionExpired) {
            await onSessionExpired?.({ result: result as FailureResult<TResult> });
            return result;
        }

        if (result.formError) {
            toast.error(result.formError);
        }

        return result;
    }

    await onSuccess({ values, result: result as SuccessResult<TResult> });

    return result;
}

export function createActionFormInvalidHandler<TValues extends FieldValues>(
    invalidMessage: string
): SubmitErrorHandler<TValues> {
    return () => {
        toast.error(invalidMessage);
    };
}

export function useActionFormSubmit<
    TValues extends FieldValues,
    TResult extends FormActionResult<TValues> = FormActionResult<TValues>,
>({
    form,
    invalidMessage,
    action,
    onSuccess,
    onFailure,
    onSessionExpired,
    onSubmittingChange,
}: UseActionFormSubmitOptions<TValues, TResult>) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSucceeded, setSubmitSucceeded] = useState(false);

    const setSubmitting = (nextSubmitting: boolean) => {
        setIsSubmitting(nextSubmitting);
        onSubmittingChange?.(nextSubmitting);
    };

    const onSubmit: SubmitHandler<TValues> = async (values) => {
        setSubmitting(true);
        setSubmitSucceeded(false);

        try {
            await runActionFormSubmit({
                form,
                values,
                action,
                onFailure,
                onSessionExpired,
                onSuccess: async (context) => {
                    setSubmitSucceeded(true);
                    await onSuccess(context);
                },
            });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        isSubmitting,
        submitSucceeded,
        onSubmit,
        onInvalid: createActionFormInvalidHandler<TValues>(invalidMessage),
    };
}
