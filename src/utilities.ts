import { Accessor, onCleanup } from "solid-js"
import { MonthYear } from "./types"
import type { JSX, Signal } from "solid-js"
import { DAY_ONE } from "./store"
import { parseISO } from "date-fns"
import { createServerData$, redirect } from "solid-start/server"
import { getSession } from "@solid-auth/base"
import { authOpts } from "./routes/api/auth/[...solidauth]"
import { getUserFromEmail } from "./db"

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

type ParseDates<O extends object> = {
  [K in keyof O]: O[K] extends object
    ? ParseDates<O[K]>
    : O[K] extends string
    ? Date | string
    : O[K]
}

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1)

export const updateAt =
  <T>(i: number, a: T) =>
  (arr: T[]): T[] => [...arr.slice(0, i), a, ...arr.slice(i + 1)]

export const parseDates = <O extends object>(obj: O): ParseDates<O> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const dateStringRegex =
        /[+-]?\d{4}(-[01]\d(-[0-3]\d(T[0-2]\d:[0-5]\d:?([0-5]\d(\.\d+)?)?([+-][0-2]\d:[0-5]\d)?Z?)?)?)?/
      if (typeof value === "object" && value !== null)
        return [key, parseDates(value)]
      if (typeof value === "string" && value.match(dateStringRegex))
        return [key, new Date(value)]
      return [key, value]
    }),
  ) as ParseDates<O>

export const deepDateMap = (obj: object, f: any) => {
  Object.entries(obj).map(([k, v]) => [k, typeof v === "string" && v])
}

export const dateToMonthYear = (date: Date): MonthYear =>
  `${date
    .toLocaleDateString("en-us", { month: "short" })
    .toUpperCase()} ${date.getFullYear()}` as MonthYear

export function clickOutside(
  el: HTMLDivElement,
  accessor: Accessor<() => void>,
) {
  const onClick: any = (e: any) => el.contains(e.target) && accessor()?.()
  document.body.addEventListener("click", onClick)

  onCleanup(() => document.body.removeEventListener("click", onClick))
}

export const coerceToDate = (d: Date | string): Date => {
  if (typeof d === "string") {
    return parseISO(d as string)
  } else {
    return d as Date
  }
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

export const displayUSD = (n: number) =>
  n.toLocaleString("en-us", { style: "currency", currency: "USD" })

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

export function getOrdinal(n: number) {
  let ord = "th"

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st"
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd"
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd"
  }

  return ord
}

type PartialFunc<T, S> = (x: T) => S | undefined

// Map a partial function over an array by keeping only the defined results
export function mapPartial<T, S>(list: T[], f: PartialFunc<T, S>): S[] {
  let result: S[] = []
  for (const x of list) {
    const y = f(x)
    if (y) {
      result.push(y)
    }
  }
  return result
}

// export const useSession = () => {
//   return createServerData$(
//     async (_, { request }) => {
//       return await getSession(request, authOpts)
//     },
//     { key: () => ["auth_user"] }
//   )
// }

// export const useUser = async (request: Request) => {
//   const session = await getSession(request, authOpts)
//   const user = session?.user
//   if (!session || !user) {
//     throw redirect("/")
//   }
//   return (await getUserFromEmail(user?.email!))?.id
// }
