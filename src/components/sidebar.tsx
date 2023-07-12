import { useContext, type JSX, type ParentComponent } from "solid-js"
import { Panel } from "../types"
import { CentralStoreContext } from "../root"
import { A } from "solid-start"
import { useLocation } from "solid-start"

interface navButtonProps {
  panel: Panel
}

export const Sidebar = () => {
  const location = useLocation()

  const NavButton: ParentComponent<navButtonProps> = (props) => (
    <A href={`/${props.panel}`}>
      <button
        class={`mx-4 my-2 p-2 font-bold ${
          location.pathname.slice(1) == props.panel
            ? "bg-blue-400 hover:bg-blue-500"
            : "hover:bg-gray-400"
        } w-56 rounded text-left`}
      >
        {props.children}
      </button>
    </A>
  )

  return (
    <div class="fixed left-0 top-0 box-border min-h-screen w-64 bg-gray-200">
      <ul>
        <li>
          <NavButton panel="budget">Budget</NavButton>
        </li>
        <li>
          <NavButton panel="transactionView">Transactions</NavButton>
        </li>
      </ul>
    </div>
  )
}
