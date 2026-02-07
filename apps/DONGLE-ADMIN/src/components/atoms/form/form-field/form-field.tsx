import * as React from "react";
import { Input } from "@dongle/ui/input";
import { Label } from "@dongle/ui/label";
import { cn } from "@dongle/ui/utils";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    required?: boolean;
    error?: string;
    success?: string;
    description?: string;
    icon?: React.ReactNode;
    id: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, required, error, success, description, icon, className, id, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <Label htmlFor={id} className="font-semibold text-zinc-700 text-base">
                        {icon && <span className="mr-2 inline-flex">{icon}</span>}
                        {label}
                        {required && <span className="text-red-500">*</span>}
                    </Label>
                )}
                <Input
                    ref={ref}
                    id={id}
                    className={cn(
                        "focus-visible:ring-1 focus-visible:ring-zinc-100 border-zinc-200 border-1",
                        error && "border-red-400 focus-visible:ring-red-400 border-1 ",
                        success && "border-sky-400 focus-visible:ring-sky-400",
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
FormField.displayName = "FormField";

export { FormField };
