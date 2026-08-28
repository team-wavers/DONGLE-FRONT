"use client";

import dynamic from "next/dynamic";
import { Controller, useFormContext, type FieldValues } from "react-hook-form";
import { Skeleton } from "@dongle/ui/skeleton";
import type { RichTextEditorProps } from "@/shared/ui/form/rich-text-editor/rich-text-editor";
import type { BaseFieldProps } from "./rhf-field-types";

const RichTextEditor = dynamic<RichTextEditorProps>(
    () => import("@/shared/ui/form/rich-text-editor/rich-text-editor").then((module) => module.RichTextEditor),
    {
        ssr: false,
        loading: () => <Skeleton className="h-64 w-full rounded-md" />,
    }
);

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
