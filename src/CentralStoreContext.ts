import { createContext } from "solid-js"
import { type useCentralStore } from "./store"

const CentralStoreContext = createContext<ReturnType<typeof useCentralStore>>()

export default CentralStoreContext
