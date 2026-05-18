"use client";

import type { ReactNode } from "react";
import type { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

interface FormRootProps<TValues extends FieldValues> {
    form: UseFormReturn<TValues>;
    onSubmit: SubmitHandler<TValues>;
    onInvalid?: SubmitErrorHandler<TValues>;
    children: ReactNode;
    className?: string;
    formError?: string;
    id?: string;
}

export function FormRoot<TValues extends FieldValues>({
    form,
    onSubmit,
    onInvalid,
    children,
    className,
    formError,
    id,
}: FormRootProps<TValues>) {
    return (
        <FormProvider {...form}>
            <form id={id} onSubmit={form.handleSubmit(onSubmit, onInvalid)} className={className} noValidate>
                {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                {children}
            </form>
        </FormProvider>
    );
}
