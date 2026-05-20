"use client";

import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { FileUpload, type FileUploadProps } from "@/components/atoms/form/file-upload/file-upload";

type RHFFileUploadProps<TValues extends FieldValues> = Omit<
    FileUploadProps,
    "name" | "error" | "defaultValue" | "onFileChange"
> & {
    name: Path<TValues>;
    fileName: Path<TValues>;
};

export function RHFFileUpload<TValues extends FieldValues>({
    name,
    fileName,
    ...props
}: RHFFileUploadProps<TValues>) {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext<TValues>();
    const error = errors[name]?.message ?? errors[fileName]?.message;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const existingUrls = Array.isArray(field.value)
                    ? field.value.filter((value: unknown): value is string => typeof value === "string")
                    : [];

                return (
                    <FileUpload
                        {...props}
                        name={fileName}
                        defaultValue={existingUrls}
                        onFileChange={(files) => {
                            const nextFile = files[0] ?? null;
                            setValue(fileName, nextFile as TValues[typeof fileName], {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        onUrlRemove={(url) => {
                            field.onChange(existingUrls.filter((item: string) => item !== url));
                            props.onUrlRemove?.(url);
                        }}
                        onReplaceExistingUrls={() => {
                            field.onChange([]);
                            props.onReplaceExistingUrls?.();
                        }}
                        error={typeof error === "string" ? error : undefined}
                    />
                );
            }}
        />
    );
}
