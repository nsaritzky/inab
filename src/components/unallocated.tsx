import { useContext } from "solid-js"
import { CentralStoreContext } from "../App"

const Unallocated = () => {
  const [state, {}] = useContext(CentralStoreContext)
  const allAllocated = () => state.unallocated == 0

  return (
    <div
      class={`mx-auto ${
        allAllocated() ? "bg-gray-300" : "bg-green-300"
      } p-4 rounded`}
    >
      Unallocated:{" "}
      {state.unallocated.toLocaleString("en-us", {
        style: "currency",
        currency: "USD",
      })}
    </div>
  )
}

export default Unallocated
