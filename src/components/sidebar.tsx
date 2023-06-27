import { useContext, type JSX, type ParentComponent } from "solid-js"
import { Panel } from "../types"
import { CentralStoreContext } from "../App"

interface navButtonProps {
  panel: Panel
}

export const Sidebar = () => {
  const [store, { setPanel }] = useContext(CentralStoreContext)

  const NavButton: ParentComponent<navButtonProps> = (props) => (
    <button
      class={`p-4 font-bold ${
        store.panel == props.panel
          ? "bg-blue-400 hover:bg-blue-500"
          : "hover:bg-gray-400"
      } w-full text-left`}
      onClick={(e) => {
        e.preventDefault
        setPanel(props.panel)
      }}
    >
      {props.children}
    </button>
  )

  return (
    <div class="fixed top-0 left-0 min-h-screen w-64 bg-gray-200">
      <ul>
        <li>
          <NavButton panel="budget">Budget</NavButton>
        </li>
        <li>
          <NavButton panel="transactions">Transactions</NavButton>
        </li>
      </ul>
    </div>
  )
}
