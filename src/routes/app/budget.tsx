import { useRouteData, type RouteDataArgs, createRouteData } from "solid-start"
import BudgetView from "~/components/BudgetView"
import { routeData as appRouteData } from "~/routes/app"

export const routeData = ({ data }: RouteDataArgs<typeof appRouteData>) =>
  createRouteData(data)

export type BudgetRouteData = ReturnType<typeof useRouteData<typeof routeData>>

const Budget = () => {
  const rawData = useRouteData<typeof routeData>()
  return (
    <>
      <BudgetView rawData={rawData()} />
    </>
  )
}

export default Budget
