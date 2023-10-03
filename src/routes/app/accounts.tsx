import { For, Suspense, type Component } from "solid-js"
import { type RouteDataArgs, createRouteData, useRouteData } from "solid-start"
import { routeData as appRouteData } from "~/routes/app"

export const routeData = ({ data }: RouteDataArgs<typeof appRouteData>) =>
  createRouteData(data)

const Page: Component = () => {
  const data = useRouteData<typeof routeData>()
  return (
    <Suspense fallback={<div>fallback</div>}>
      <For each={data()?.accountNames}>{(name) => <div>{name}</div>}</For>
    </Suspense>
  )
}

export default Page
