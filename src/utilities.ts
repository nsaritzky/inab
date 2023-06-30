import { Accessor, onCleanup } from "solid-js"
import { MonthYear } from "./types"
import type { JSX, Signal } from "solid-js"

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

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => void
    }
  }
}
