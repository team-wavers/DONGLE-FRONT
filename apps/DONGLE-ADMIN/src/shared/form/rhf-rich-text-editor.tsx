"use client";

import { Controller, useFormContext, type FieldValues } from "react-hook-form";
import { RichTextEditor, type RichTextEditorProps } from "@/shared/components/atoms/form/rich-text-editor/rich-text-editor";
import type { BaseFieldProps } from "./rhf-field-types";

export function RHFRichTextEditor<TValues extends FieldValues>({
    name,
    ...props
}: BaseFieldProps<TValues> & Omit<RichTextEditorProps, "name" | "error" | "value" | "onChange">) {
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
                <RichTextEditor
                    {...props}
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={typeof error === "string" ? error : undefined}
                />
            )}
        />
    );
}
