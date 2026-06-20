"use client";

import { Controller, useFormContext, type FieldValues } from "react-hook-form";
import { FormSelect, type SelectOption } from "@/shared/ui/form/form-select/form-select";
import type { BaseFieldProps } from "./rhf-field-types";

interface RHFSelectFieldProps<TValues extends FieldValues> extends BaseFieldProps<TValues> {
    id: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    options: SelectOption[];
    description?: string;
    disabled?: boolean;
}

export function RHFSelectField<TValues extends FieldValues>({
    name,
    ...props
}: RHFSelectFieldProps<TValues>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<TValues>();
    const error = errors[name]?.message;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <FormSelect
                    {...props}
                    name={field.name}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    error={typeof error === "string" ? error : undefined}
                />
            )}
        />
    );
}
