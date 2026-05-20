"use client";

import type { FieldValues, Path } from "react-hook-form";

export type BaseFieldProps<TValues extends FieldValues> = {
    name: Path<TValues>;
};
