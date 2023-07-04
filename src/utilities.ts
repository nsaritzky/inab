import { Accessor, onCleanup } from "solid-js"
import { MonthYear } from "./types"
import type { JSX, Signal } from "solid-js"
import { DAY_ONE } from "./store"

export const dateToMonthYear = (date: Date): MonthYear =>
  `${date
    .toLocaleDateString("en-us", { month: "short" })
    .toUpperCase()} ${date.getFullYear()}` as MonthYear

export function clickOutside(
  el: HTMLDivElement,
  accessor: Accessor<() => void>
) {
  const onClick: any = (e: any) => el.contains(e.target) && accessor()?.()
  document.body.addEventListener("click", onClick)

  onCleanup(() => document.body.removeEventListener("click", onClick))
}

export const dateToIndex = (d: Date) =>
  12 * d.getFullYear() +
  d.getMonth() -
  12 * DAY_ONE.getFullYear() -
  DAY_ONE.getMonth()

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => void
    }
  }
}

export const dateParser = (_: string, value: undefined) => {
  const ISOre =
    /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/
  if (typeof value === "string") {
    const a = ISOre.exec(value)
    if (a) {
      return new Date(value)
    }
    return value
  }
  return value
}
