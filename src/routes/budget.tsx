import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  createMemo,
} from "solid-js"
import MonthSelector from "~/components/monthSelector"
import CentralStoreContext from "~/CentralStoreContext"
import Unallocated from "~/components/unallocated"
import { BudgetRow } from "~/components/BudgetRow"
import { BudgetInspector } from "~/components/BudgetInspector"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import { useRouteData, type RouteDataArgs } from "solid-start"
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import {
  getEnvelopesWithGoals,
  getTransactions,
  getUserFromEmail,
  setAllocation,
} from "../db"
import { Envelope, Transaction } from "@prisma/client"
import { coerceToDate, dateToIndex } from "../utilities"
import { Suspense } from "solid-js"
import { updateAt } from "../utilities"
import { getSession } from "@solid-auth/base"
import { authOpts } from "./api/auth/[...solidauth]"
import BudgetView from "~/components/BudgetView"

export const routeData = (props: RouteDataArgs) =>
  createServerData$(async (_, event) => {
    const session = await getSession(event.request, authOpts)
    const user = session?.user
    if (!session || !session.user) {
      throw redirect("/")
    }
    const dbUser = await getUserFromEmail(user!.email!)
    return {
      transactions: await getTransactions(dbUser.id),
      envelopes: await getEnvelopesWithGoals(dbUser.id),
      user: dbUser,
    }
  })

export type BudgetRouteData = ReturnType<
  ReturnType<typeof useRouteData<typeof routeData>>
>

const Budget = () => {
  const rawData = useRouteData<typeof routeData>()
  return <BudgetView rawData={rawData()} />
}

export default Budget
