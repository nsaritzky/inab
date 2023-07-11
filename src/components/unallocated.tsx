import { useContext } from "solid-js"
import { CentralStoreContext } from "../root"

interface Props {
  unallocated: number | undefined
}

const Unallocated = (props: Props) => {
  const allAllocated = () => props.unallocated == 0
  const overAllocated = () =>
    props.unallocated ? props.unallocated < 0 : false

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
        {props.unallocated?.toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </div>
    </div>
  )
}

export default Unallocated
