import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dongle/ui/select";
import { Label } from "@dongle/ui/label";
import { cn } from "@dongle/ui/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  description?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  (
    {
      label,
      required,
      error,
      success,
      description,
      icon,
      placeholder,
      options,
      value,
      defaultValue,
      name,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(error && "text-red-600", success && "text-green-600")}
          >
            {icon && <span className="mr-2 inline-flex">{icon}</span>}
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Select name={name} value={value} defaultValue={defaultValue} {...props}>
          <SelectTrigger
            ref={ref}
            id={fieldId}
            className={cn(
              error && "border-red-500 focus:ring-red-500",
              success && "border-green-500 focus:ring-green-500",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter((option) => option.value && option.value.trim() !== "")
              .map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {description && !error && !success && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

export { FormSelect };
