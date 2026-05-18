"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

type FieldErrorMap<TField extends string = string> = Partial<Record<TField, string>>;

export function applyServerFieldErrors<TValues extends FieldValues>(
    form: UseFormReturn<TValues>,
    fieldErrors?: FieldErrorMap<Extract<keyof TValues, string>>
) {
    if (!fieldErrors) {
        return;
    }

    Object.entries(fieldErrors).forEach(([name, message]) => {
        if (!message) {
            return;
        }

        form.setError(name as Path<TValues>, {
            type: "server",
            message,
        });
    });
}
