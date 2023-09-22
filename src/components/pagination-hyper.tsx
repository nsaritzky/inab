import { type Component, For } from "solid-js"

interface PaginationProps {
  pageCount: number
  activePage: number
  setActivePage: (n: number) => void
  prevPage: () => void
  nextPage: () => void
}

const Pagination: Component<PaginationProps> = (props) => (
  <ol class="flex justify-center gap-1 text-xs font-medium">
    <li>
      <a
        onClick={props.prevPage}
        class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180"
      >
        <span class="sr-only">Prev Page</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </li>
    <For each={[...Array(props.pageCount).keys()].map((n) => n + 1)}>
      {(n) => (
        <li>
          <a
            onClick={() => props.setActivePage(n - 1)}
            class={
              "block h-8 w-8 rounded border border-gray-100 text-center leading-8 " +
              (props.activePage + 1 == n
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900")
            }
          >
            {n}
          </a>
        </li>
      )}
    </For>
    <li>
      <a
        onClick={props.nextPage}
        class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180"
      >
        <span class="sr-only">Next Page</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </a>
    </li>
  </ol>
)

export default Pagination
