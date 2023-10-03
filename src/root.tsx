// @refresh reload
import { createContext, Suspense } from "solid-js"
import {
  useLocation,
  Body,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start"
import "./root.css"
import { useCentralStore } from "./store"
import CentralStoreContext from "./CentralStoreContext"
import {
  createServerData$,
  createServerAction$,
  redirect,
} from "solid-start/server"
import { auth } from "./auth/lucia"

export default function Root() {
  const user = createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    return session?.user
  })

  const [_, { Form }] = createServerAction$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    if (!session) {
      return redirect("/login")
    }
    await auth.invalidateSession(session.sessionId)
    return redirect("/")
  })

  const ctx = useCentralStore()
  /* const active = (path: string) =>
   *   path == location.pathname
   *     ? "border-sky-600"
   *     : "border-transparent hover:border-sky-600"; */
  return (
    <Html lang="en">
      <Head>
        <Title>flite</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <nav class="flex justify-between p-2 fixed left-0 top-0 box-border w-full bg-sky-300 h-12">
          <div>Hello</div>
          <Suspense>
            <Form>
              <button
                class={`px-2 py-1 rounded ${
                  user() ? "bg-red-300" : "bg-blue-600"
                }`}
              >
                {user() ? "Sign out" : "Sign in"}
              </button>
            </Form>
          </Suspense>
        </nav>
        <CentralStoreContext.Provider value={ctx}>
          <div class="mt-12">
            <Routes>
              <FileRoutes />
            </Routes>
          </div>
        </CentralStoreContext.Provider>
        <Scripts />
      </Body>
    </Html>
  )
}
