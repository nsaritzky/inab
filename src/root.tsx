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
import { Sidebar } from "./components/sidebar"
import "./root.css"
import { useCentralStore } from "./store"
import { SessionProvider } from "@solid-auth/base/client"
import CentralStoreContext from "./CentralStoreContext"

export default function Root() {
  const ctx = useCentralStore()
  const location = useLocation()
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
        <Suspense>
          <SessionProvider>
            <Sidebar />
            <CentralStoreContext.Provider value={ctx}>
              <Routes>
                <FileRoutes />
              </Routes>
            </CentralStoreContext.Provider>
            <Scripts />
          </SessionProvider>
        </Suspense>
      </Body>
    </Html>
  )
}
