"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@dongle/ui/button";
import { Calendar } from "@dongle/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@dongle/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dongle/ui/select";
import { useEffect, useState } from "react";
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

export function FormDatePicker({
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
    const [date, setDate] = useState<Date | undefined>(value || defaultValue);

    useEffect(() => {
        setDate(value || defaultValue);
    }, [defaultValue, value]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        const nextDate =
            selectedDate && includeTime && date ? mergeDateWithTime(selectedDate, format(date, "HH:mm")) : selectedDate;

        setDate(nextDate);
        onSelect?.(nextDate);
    };

    const handleTimePartChange = (part: "hour" | "minute", nextValue: string) => {
        if (!date) return;

        const nextDate = mergeDateWithTimePart(date, part, nextValue);
        setDate(nextDate);
        onSelect?.(nextDate);
    };

    return (
        <div className="flex flex-col gap-2">
            <input type="hidden" name={name ?? id} value={getHiddenValue(date, includeTime)} />
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
                        data-empty={!date}
                        className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal">
                        <CalendarIcon />
                        <span>{getDisplayValue(date, includeTime)}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        required
                        id={id}
                        mode="single"
                        buttonVariant="outline"
                        selected={date}
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
                                    value={date ? format(date, "HH") : undefined}
                                    onValueChange={(nextValue) => handleTimePartChange("hour", nextValue)}
                                    disabled={!date}>
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
                                    value={date ? format(date, "mm") : undefined}
                                    onValueChange={(nextValue) => handleTimePartChange("minute", nextValue)}
                                    disabled={!date}>
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
}
