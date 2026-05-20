"use client";

import { useCallback, useMemo } from "react";
import {
    Controller,
    useFormContext,
    type ControllerRenderProps,
    type FieldValues,
    type Path,
} from "react-hook-form";
import { FormDatePicker } from "@/components/atoms/form/form-datepicker/form-datepicker";
import { formatDatePickerValue, parseDatePickerValue } from "./date-picker-value";
import type { BaseFieldProps } from "./rhf-field-types";

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
