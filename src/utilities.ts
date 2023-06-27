import { MonthYear } from "./types"

export const dateToMonthYear = (date: Date): MonthYear =>
  `${date
    .toLocaleDateString("en-us", { month: "short" })
    .toUpperCase()} ${date.getFullYear()}` as MonthYear
