import { getSession } from "@solid-auth/base"
import { signIn } from "@solid-auth/base/client"
import { Show } from "solid-js"
import { A, Navigate, useRouteData } from "solid-start"
import { createServerData$ } from "solid-start/server"
import { authOpts } from "./api/auth/[...solidauth]"

export const routeData = () =>
  createServerData$(
    async (_, event) => {
      return await getSession(event.request, authOpts)
    },
    { key: () => "authUser" }
  )

export default function Home() {
  const session = useRouteData<typeof routeData>()
  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <Show
        when={session()?.user}
        fallback={<button onClick={() => signIn("google")}>Sign in</button>}
      >
        <Navigate href="/budget" />
      </Show>
    </main>
  )
}
