import { clsx, type ClassValue } from "clsx"
import {
  formatDateByLocale as formatDateByLocaleBase,
  formatDateRange as formatDateRangeBase,
  type DateDisplayFormatOptions,
} from "@dongle/utils"
import { twMerge } from "tailwind-merge"
export { normalizeSocialUrl, type SocialPlatform } from "@dongle/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateByLocale(value: string | Date, locale = "ko-KR", options?: Omit<DateDisplayFormatOptions, "locale">) {
  return formatDateByLocaleBase(value, { ...options, locale })
}

export function formatDateRange(start: string | Date, end: string | Date, locale = "ko-KR", options?: Omit<DateDisplayFormatOptions, "locale">) {
  return formatDateRangeBase(start, end, { ...options, locale })
}
