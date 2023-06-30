import { useContext } from "solid-js"
import { CentralStoreContext } from "../App"

const Unallocated = () => {
  const [state, {}] = useContext(CentralStoreContext)
  const allAllocated = () => state.unallocated == 0
  const overAllocated = () => state.unallocated < 0

  return (
    <div class="flex-1">
      <div
        class={`mx-auto w-max ${
          overAllocated()
            ? "bg-red-300"
            : allAllocated()
            ? "bg-gray-300"
            : "bg-green-300"
        } rounded p-4`}
      >
        Unallocated:{" "}
        {state.unallocated.toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </div>
    </div>
  )
}

export default Unallocated
