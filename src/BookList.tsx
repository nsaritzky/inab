import { createSignal, For } from "solid-js"
import { Book } from "./App"

interface BookListProps {
  books: Book[]
}

export function BookList(props: BookListProps) {
  const totalBooks = () => props.books.length
  return (
    <>
      <h2>My Books ({totalBooks()})</h2>
      <ul>
        <For each={props.books}>
          {(book) => (
            <li>
              {book.title}
              <span style={{ "font-style": "italic" }}> ({book.author})</span>
            </li>
          )}
        </For>
      </ul>
    </>
  )
}
