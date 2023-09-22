import Fuse from "fuse.js"
import { createMemo, type Accessor, createEffect } from "solid-js"

export function createFuse<T>(
  data: T[],
  options: Fuse.IFuseOptions<T>,
  query: string,
) {
  const fuse = new Fuse(data, options)

  createEffect(() => {
    fuse.setCollection(data())
  })

  return fuse.search(query)
}
