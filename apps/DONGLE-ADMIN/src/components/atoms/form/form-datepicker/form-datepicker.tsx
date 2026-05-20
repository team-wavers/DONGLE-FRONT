"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@dongle/ui/button";
import { Calendar } from "@dongle/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@dongle/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@dongle/ui/label";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

interface FormDatePickerProps {
    label?: string;
    id: string;
    name?: string;
    required?: boolean;
    icon?: React.ReactNode;
    description?: string;
    error?: string;
    success?: string;
    defaultValue?: Date;
    value?: Date;
    includeTime?: boolean;
    onSelect?: (date: Date | undefined) => void;
}

function mergeDateWithTime(date: Date, timeValue: string) {
    const [hours = "0", minutes = "0"] = timeValue.split(":");
    const nextDate = new Date(date);

    nextDate.setHours(Number(hours), Number(minutes), 0, 0);
    return nextDate;
}

function mergeDateWithTimePart(date: Date, part: "hour" | "minute", value: string) {
    const nextDate = new Date(date);
    const numericValue = Number(value);

    if (part === "hour") {
        nextDate.setHours(numericValue);
    } else {
        nextDate.setMinutes(numericValue);
    }

    nextDate.setSeconds(0, 0);
    return nextDate;
}

function getHiddenValue(date: Date | undefined, includeTime: boolean) {
    if (!date) return "";

    return format(date, includeTime ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd");
}

function getDisplayValue(date: Date | undefined, includeTime: boolean) {
    if (!date) return includeTime ? "날짜와 시간을 선택하세요" : "날짜를 선택하세요";

    return format(date, includeTime ? "PPP HH:mm" : "PPP", { locale: ko });
}

export const FormDatePicker = memo(function FormDatePicker({
    label,
    id,
    name,
    required,
    icon,
    description,
    error,
    success,
    defaultValue,
    value,
    includeTime = false,
    onSelect,
}: FormDatePickerProps) {
    const isControlled = value !== undefined;
    const [date, setDate] = useState<Date | undefined>(value ?? defaultValue);
    const selectedDate = isControlled ? value : date;

    useEffect(() => {
        if (!isControlled) {
            setDate(defaultValue);
        }
    }, [defaultValue, isControlled]);

    const hiddenValue = useMemo(() => getHiddenValue(selectedDate, includeTime), [includeTime, selectedDate]);
    const displayValue = useMemo(() => getDisplayValue(selectedDate, includeTime), [includeTime, selectedDate]);
    const selectedHour = useMemo(() => (selectedDate ? format(selectedDate, "HH") : undefined), [selectedDate]);
    const selectedMinute = useMemo(() => (selectedDate ? format(selectedDate, "mm") : undefined), [selectedDate]);

    const commitDate = useCallback(
        (nextDate: Date | undefined) => {
            if (!isControlled) {
                setDate(nextDate);
            }

            onSelect?.(nextDate);
        },
        [isControlled, onSelect]
    );

    const handleDateSelect = useCallback(
        (nextSelectedDate: Date | undefined) => {
            const nextDate =
                nextSelectedDate && includeTime && selectedDate
                    ? mergeDateWithTime(nextSelectedDate, format(selectedDate, "HH:mm"))
                    : nextSelectedDate;

            commitDate(nextDate);
        },
        [commitDate, includeTime, selectedDate]
    );

    const handleTimePartChange = useCallback(
        (part: "hour" | "minute", nextValue: string) => {
            if (!selectedDate) return;

            commitDate(mergeDateWithTimePart(selectedDate, part, nextValue));
        },
        [commitDate, selectedDate]
    );

    return (
        <div className="flex flex-col gap-2">
            <input type="hidden" name={name ?? id} value={hiddenValue} />
            {label && (
                <Label htmlFor={id} className="font-semibold text-zinc-700 text-base">
                    {icon && <span className="mr-2 inline-flex">{icon}</span>}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        data-empty={!selectedDate}
                        className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal">
                        <CalendarIcon />
                        <span>{displayValue}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        required
                        id={id}
                        mode="single"
                        buttonVariant="outline"
                        selected={selectedDate}
                        locale={ko}
                        onSelect={handleDateSelect}
                    />
                    {includeTime ? (
                        <div className="border-t p-3">
                            <Label className="text-sm font-medium text-zinc-700">
                                시간
                            </Label>
                            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <Select
                                    value={selectedHour}
                                    onValueChange={(nextValue) => handleTimePartChange("hour", nextValue)}
                                    disabled={!selectedDate}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="시" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                        {HOUR_OPTIONS.map((hour) => (
                                            <SelectItem key={hour} value={hour}>
                                                {hour}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-zinc-500">:</span>
                                <Select
                                    value={selectedMinute}
                                    onValueChange={(nextValue) => handleTimePartChange("minute", nextValue)}
                                    disabled={!selectedDate}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="분" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                        {MINUTE_OPTIONS.map((minute) => (
                                            <SelectItem key={minute} value={minute}>
                                                {minute}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : null}
                </PopoverContent>
            </Popover>

            {description && !error && !success && <p className="text-sm text-muted-foreground">{description}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-sky-500">{success}</p>}
        </div>
    );
});
