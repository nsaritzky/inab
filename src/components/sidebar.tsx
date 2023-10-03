import { useContext, type JSX, type ParentComponent } from "solid-js"
import { Panel } from "../types"
import { A } from "solid-start"
import { useLocation } from "solid-start"

interface navButtonProps {
  panel: Panel
}

export const Sidebar = () => {
  const location = useLocation()

  const NavButton: ParentComponent<navButtonProps> = (props) => (
    <A href={`/app/${props.panel}`}>
      <button
        class={`mx-4 my-2 p-2 font-bold ${
          location.pathname.split("/").pop() == props.panel
            ? "bg-sky-400 hover:bg-sky-500"
            : "hover:bg-gray-400"
        } w-56 rounded text-left`}
      >
        {props.children}
      </button>
    </A>
  )

  return (
    <div class="fixed left-0 top-12 box-border min-h-screen w-64 bg-gray-200">
      <ul>
        <li>
          <NavButton panel="budget">Budget</NavButton>
        </li>
        <li>
          <NavButton panel="transactions">Transactions</NavButton>
        </li>
        <li>
          <NavButton panel="accounts">Accounts</NavButton>
        </li>
      </ul>
    </div>
  )
}
