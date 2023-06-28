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
      class={`mx-4 my-2 p-2 font-bold ${
        store.panel == props.panel
          ? "bg-blue-400 hover:bg-blue-500"
          : "hover:bg-gray-400"
      } w-56 rounded text-left`}
      onClick={(e) => {
        e.preventDefault
        setPanel(props.panel)
      }}
    >
      {props.children}
    </button>
  )

  return (
    <div class="fixed left-0 top-0 box-border min-h-screen w-64 bg-gray-200">
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
