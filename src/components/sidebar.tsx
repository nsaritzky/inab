import { setState } from "../App"

export const Sidebar = () => (
  <div class="fixed top-0 left-0 min-h-screen w-64">
    <ul>
      <li>
        <button
          onClick={(e) => {
            e.preventDefault()
            setState("panel", "transactions")
          }}
        >
          Budget
        </button>
      </li>
      <li>
        <button
          onClick={(e) => {
            e.preventDefault()
            setState("panel", "budget")
          }}
        >
          Transactions
        </button>
      </li>
    </ul>
  </div>
)
