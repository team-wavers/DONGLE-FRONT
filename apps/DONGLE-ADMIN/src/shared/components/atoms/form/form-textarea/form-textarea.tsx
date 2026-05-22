"use client";

import * as React from "react";
import { Label } from "@dongle/ui/label";
import { cn } from "@dongle/ui/utils";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    required?: boolean;
    error?: string;
    success?: string;
    description?: string;
    icon?: React.ReactNode;
    rows?: number;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    (
        { label, required, error, success, description, icon, className, id, rows = 8, value, onChange, ...props },
        ref
    ) => {
        const textareaRef = React.useRef<HTMLTextAreaElement>(null);
        const combinedRef = React.useCallback(
            (node: HTMLTextAreaElement | null) => {
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
                textareaRef.current = node;
            },
            [ref]
        );

        // 자동 높이 조절 함수
        const adjustHeight = React.useCallback(() => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }, []);

        // value 변경 시 높이 조절
        React.useEffect(() => {
            adjustHeight();
        }, [value, adjustHeight]);

        // onChange 핸들러와 자동 높이 조절 결합
        const handleChange = React.useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                adjustHeight();
                onChange?.(e);
            },
            [onChange, adjustHeight]
        );

        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <Label htmlFor={id} className="font-semibold text-zinc-700 text-base">
                        {icon && <span className="mr-2 inline-flex">{icon}</span>}
                        {label}
                        {required && <span className="text-red-500">*</span>}
                    </Label>
                )}
                <textarea
                    ref={combinedRef}
                    id={id}
                    rows={rows}
                    value={value}
                    onChange={handleChange}
                    className={cn(
                        "w-full px-3 py-2 border border-zinc-200 rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-zinc-100 focus:border-transparent",
                        "resize-none placeholder:text-muted-foreground overflow-hidden",
                        error && "border-red-400 focus:ring-red-400",
                        success && "border-sky-400 focus:ring-sky-400",
                        className
                    )}
                    {...props}
                />
                {description && !error && !success && <p className="text-sm text-muted-foreground">{description}</p>}
                {error && <p className="text-xs text-red-500 ">{error}</p>}
                {success && <p className="text-xs text-sky-500">{success}</p>}
            </div>
        );
    }
);
FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
