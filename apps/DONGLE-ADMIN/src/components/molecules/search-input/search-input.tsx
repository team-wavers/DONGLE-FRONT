"use client";

import { Search, X } from "lucide-react";
import { Input } from "@dongle/ui/input";
import { Button } from "@dongle/ui/button";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "검색어를 입력하세요",
    disabled = false,
}: SearchInputProps) {
    const hasValue = value.length > 0;

    return (
        <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="h-11 rounded-xl border-zinc-200 bg-white pl-10 pr-11"
            />
            {hasValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange("")}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                    <X className="h-4 w-4" />
                    <span className="sr-only">검색어 지우기</span>
                </Button>
            )}
        </div>
    );
}
