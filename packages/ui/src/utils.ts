import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateByLocale(value: string, locale = "ko-KR") {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\. /g, ".")
    .replace(/\.$/, "")
}

export function formatDateRange(start: string, end: string, locale = "ko-KR") {
  const startDate = formatDateByLocale(start, locale)
  const endDate = formatDateByLocale(end, locale)

  if (startDate === "-" || endDate === "-") {
    return "-"
  }

  return `${startDate} ~ ${endDate}`
}
