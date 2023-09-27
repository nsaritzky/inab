import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  createMemo,
  Suspense,
} from "solid-js"
import { useRouteData, type RouteDataArgs, createRouteData } from "solid-start"
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
} from "~/db"
import BudgetView from "~/components/BudgetView"
import { routeData as appRouteData } from "~/routes/app"
import { auth } from "~/auth/lucia"

export const routeData = ({ data }: RouteDataArgs<typeof appRouteData>) =>
  createRouteData(() => data())

export type BudgetRouteData = ReturnType<
  ReturnType<typeof useRouteData<typeof routeData>>
>

const Budget = () => {
  const rawData = useRouteData<typeof routeData>()
  return <BudgetView rawData={rawData()} />
}

export default Budget
