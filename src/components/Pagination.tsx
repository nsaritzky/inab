// Pagination.tsx
import { createSignal, For, JSX } from "solid-js"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = (props: PaginationProps): JSX.Element => {
  const handlePageChange = (page: number) => {
    props.onPageChange(page)
  }

  return (
    <ul class="flex">
      <For each={[...Array(props.totalPages).keys()].map((i) => i + 1)}>
        {(i) => (
          <li>
            <button
              class={`border border-blue-300 px-2 py-1 ${
                i === props.currentPage
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => props.onPageChange(i)}
            >
              {i}
            </button>
          </li>
        )}
      </For>
    </ul>
  )
}

export default Pagination
