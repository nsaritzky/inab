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
    <ul>
      <For each={[...Array(props.totalPages).keys()].map((i) => i + 1)}>
        {(i) => <li onClick={() => props.onPageChange(i)}>{i}</li>}
      </For>
    </ul>
  )
}

export default Pagination
