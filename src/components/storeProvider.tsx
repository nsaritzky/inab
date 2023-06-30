import { ParentComponent, createContext } from "solid-js"
import { createCentralStore } from "../store"

const CentralStoreContext = createContext()

const CentralStoreProvider: ParentComponent = (props) => {
  const centralStore = createCentralStore()

  return (
    <CentralStoreContext.Provider value={centralStore}>
      {props.children}
    </CentralStoreContext.Provider>
  )
}

export default CentralStoreProvider
