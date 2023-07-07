import { useContext, type JSX, type ParentComponent } from "solid-js";
import { Panel } from "../types";
import { A } from "solid-start";
import { CentralStoreContext } from "../root";

interface navButtonProps {
  route: string;
}

export const Sidebar = () => {
  const NavButton: ParentComponent<navButtonProps> = (props) => (
    <A
      href={props.route}
      activeClass="bg-blue-400 hover:bg-blue-500"
      inactiveClass="hover:bg-gray-400"
      class={`mx-4 my-2 w-56 rounded p-2 text-left font-bold`}
    >
      {props.children}
    </A>
  );

  return (
    <div class="fixed left-0 top-0 box-border min-h-screen w-64 bg-gray-200">
      <ul>
        <li>
          <NavButton route="/budget">Budget</NavButton>
        </li>
        <li>
          <NavButton route="/transactionView">Transactions</NavButton>
        </li>
      </ul>
    </div>
  );
};
