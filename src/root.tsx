// @refresh reload
import { createContext, Suspense } from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import { Sidebar } from "./components/sidebar";
import "./root.css";
import { createCentralStore } from "./store";

export const CentralStoreContext =
  createContext<ReturnType<typeof createCentralStore>>();

export default function Root() {
  const ctx = createCentralStore();
  const location = useLocation();
  /* const active = (path: string) =>
   *   path == location.pathname
   *     ? "border-sky-600"
   *     : "border-transparent hover:border-sky-600"; */
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Sidebar />
        <CentralStoreContext.Provider value={ctx}>
          <Routes>
            <FileRoutes />
          </Routes>
        </CentralStoreContext.Provider>
        <Scripts />
      </Body>
    </Html>
  );
}