import { setState, state } from "../store"
import type { JSX, ParentComponent } from "solid-js"
import { Panel } from "../types"

interface navButtonProps {
  panel: Panel
}

const NavButton: ParentComponent<navButtonProps> = (props) => (
  <button
    class={`p-4 font-bold ${
      state.panel == props.panel
        ? "bg-blue-400 hover:bg-blue-500"
        : "hover:bg-gray-400"
    } w-full text-left`}
    onClick={(e) => {
      e.preventDefault
      setState("panel", props.panel)
    }}
  >
    {props.children}
  </button>
)

export const Sidebar = () => (
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
