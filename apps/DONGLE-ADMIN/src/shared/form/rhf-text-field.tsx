"use client";

import { useFormContext, type FieldValues } from "react-hook-form";
import { FormField, type FormFieldProps } from "@/shared/components/atoms/form/form-field/form-field";
import type { BaseFieldProps } from "./rhf-field-types";

export function RHFTextField<TValues extends FieldValues>({
    name,
    ...props
}: BaseFieldProps<TValues> & Omit<FormFieldProps, "name" | "error">) {
    const {
        register,
        formState: { errors },
    } = useFormContext<TValues>();
    const error = errors[name]?.message;

    return <FormField {...props} {...register(name)} error={typeof error === "string" ? error : undefined} />;
}
