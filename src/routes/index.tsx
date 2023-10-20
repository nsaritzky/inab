import { A, Navigate, Outlet, useRouteData } from "solid-start"
import { createServerData$ } from "solid-start/server"
import { auth } from "~/auth/lucia"

// export const routeData = () =>
//   createServerData$(
//     async (_, event) => {
//       return await getSession(event.request, authOpts)
//     },
//     { key: () => "authUser" },
//   )

// export const routeData = () => {
//   return createServerData$(async (_, event) => {
//     const authRequest = auth.handleRequest(event.request)
//     const session = await authRequest.validate()
//     console.log(session)
//     if (!session) {
//       console.log("no session")
//       throw redirect("/login")
//     }
//   })
// }

export const routeData = () =>
  createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    return session?.user
  })

export default function Home() {
  const user = useRouteData<typeof routeData>()

  return (
    <>
      <main></main>
    </>
  )
}
