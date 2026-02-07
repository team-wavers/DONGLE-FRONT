"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@dongle/ui/button";
import { Calendar } from "@dongle/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@dongle/ui/popover";
import { useState } from "react";
import { Label } from "@dongle/ui/label";

export function FormDatePicker({
    label,
    id,
    required,
    icon,
    description,
    error,
    success,
    defaultValue,
    value,
    onSelect,
}: {
    label?: string;
    id: string;
    required?: boolean;
    icon?: React.ReactNode;
    description?: string;
    error?: string;
    success?: string;
    defaultValue?: Date;
    value?: Date;
    onSelect?: (date: Date | undefined) => void;
}) {
    const [date, setDate] = useState<Date | undefined>(value || defaultValue);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
            onSelect?.(selectedDate);
        }
    };

    return (
        <div className="flex flex-col gap-2">
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
                        variant="outline"
                        data-empty={!date}
                        className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal">
                        <CalendarIcon />
                        {date ? format(date, "PPP", { locale: ko }) : <span>날짜를 선택하세요</span>}
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
                </PopoverContent>
            </Popover>

            {description && !error && !success && <p className="text-sm text-muted-foreground">{description}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-sky-500">{success}</p>}
        </div>
    );
}
