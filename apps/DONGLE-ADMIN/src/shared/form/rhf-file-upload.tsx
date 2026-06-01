"use client";

import { useRef } from "react";
import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { FileUpload, type FileUploadProps } from "@/shared/ui/form/file-upload/file-upload";

type RHFFileUploadProps<TValues extends FieldValues> = Omit<
    FileUploadProps,
    "name" | "error" | "defaultValue" | "onFileChange"
> & {
    name: Path<TValues>;
    fileName: Path<TValues>;
};

export function getReplaceCancelRestoredUrls({
    selectionMode,
    nextFileCount,
    currentExistingUrls,
    replacedExistingUrls,
}: {
    selectionMode?: FileUploadProps["selectionMode"];
    nextFileCount: number;
    currentExistingUrls: string[];
    replacedExistingUrls: string[] | null;
}) {
    if (
        selectionMode !== "replace" ||
        nextFileCount > 0 ||
        currentExistingUrls.length > 0 ||
        !replacedExistingUrls ||
        replacedExistingUrls.length === 0
    ) {
        return null;
    }

    return replacedExistingUrls;
}

export function getNextReplaceExistingUrlsSnapshot({
    currentExistingUrls,
    replacedExistingUrls,
}: {
    currentExistingUrls: string[];
    replacedExistingUrls: string[] | null;
}) {
    if (currentExistingUrls.length > 0) {
        return currentExistingUrls;
    }

    return replacedExistingUrls;
}

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
    const replacedExistingUrlsRef = useRef<string[] | null>(null);

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
                            const restoredUrls = getReplaceCancelRestoredUrls({
                                selectionMode: props.selectionMode,
                                nextFileCount: files.length,
                                currentExistingUrls: existingUrls,
                                replacedExistingUrls: replacedExistingUrlsRef.current,
                            });

                            if (restoredUrls) {
                                field.onChange(restoredUrls);
                                replacedExistingUrlsRef.current = null;
                            }

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
                            replacedExistingUrlsRef.current = getNextReplaceExistingUrlsSnapshot({
                                currentExistingUrls: existingUrls,
                                replacedExistingUrls: replacedExistingUrlsRef.current,
                            });
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
