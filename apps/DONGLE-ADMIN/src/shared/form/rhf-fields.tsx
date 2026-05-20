"use client";

import { useCallback, useMemo } from "react";
import {
    Controller,
    useFormContext,
    type ControllerRenderProps,
    type FieldValues,
    type Path,
} from "react-hook-form";
import { FormField, type FormFieldProps } from "@/components/atoms/form/form-field/form-field";
import { FormSelect, type SelectOption } from "@/components/atoms/form/form-select/form-select";
import { RichTextEditor, type RichTextEditorProps } from "@/components/atoms/form/rich-text-editor/rich-text-editor";
import { FormDatePicker } from "@/components/atoms/form/form-datepicker/form-datepicker";
import { FileUpload, type FileUploadProps } from "@/components/atoms/form/file-upload/file-upload";
import { formatDatePickerValue, parseDatePickerValue } from "./date-picker-value";

type BaseFieldProps<TValues extends FieldValues> = {
    name: Path<TValues>;
};

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

interface RHFDatePickerProps<TValues extends FieldValues> extends BaseFieldProps<TValues> {
    id: string;
    label?: string;
    required?: boolean;
    description?: string;
    includeTime?: boolean;
    triggerClassName?: string;
}

interface RHFDatePickerControlProps<TValues extends FieldValues> {
    field: ControllerRenderProps<TValues, Path<TValues>>;
    pickerProps: RHFDatePickerProps<TValues>;
    error?: string;
}

function RHFDatePickerControl<TValues extends FieldValues>({
    field,
    pickerProps,
    error,
}: RHFDatePickerControlProps<TValues>) {
    const dateValue = useMemo(() => parseDatePickerValue(field.value), [field.value]);
    const handleSelect = useCallback(
        (date: Date | undefined) => {
            field.onChange(formatDatePickerValue(date, { includeTime: pickerProps.includeTime }));
        },
        [field.onChange, pickerProps.includeTime]
    );

    return (
        <FormDatePicker
            {...pickerProps}
            name={field.name}
            value={dateValue}
            onSelect={handleSelect}
            error={error}
        />
    );
}

export function RHFDatePicker<TValues extends FieldValues>({
    name,
    ...props
}: RHFDatePickerProps<TValues>) {
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
                <RHFDatePickerControl
                    field={field}
                    pickerProps={{ ...props, name }}
                    error={typeof error === "string" ? error : undefined}
                />
            )}
        />
    );
}

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
