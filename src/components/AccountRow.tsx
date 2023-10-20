import { createSignal, type Component, Show, createEffect } from "solid-js"
import { A } from "solid-start"
import { BankAccount } from "@prisma/client"
import { FiEdit2 } from "solid-icons/fi"
import { createServerAction$ } from "solid-start/server"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import { setBankAccountName } from "~/db"
import { FaSolidLink } from "solid-icons/fa"
import { ImCancelCircle } from "solid-icons/im"

interface Props {
  account: BankAccount
  balance: number
}

const BASE_URL = "http://localhost:3000"

const AccountRow: Component<Props> = (props) => {
  const keyDownEvent = useKeyDownEvent()
  const [renaming, setRenaming] = createSignal(false)
  const [enrolling, { Form }] = createServerAction$(async (form: FormData) => {
    const id = parseInt(form.get("id") as string)
    const newName = form.get("name") as string
    await setBankAccountName(id, newName)
  })
  const name = () => props.account.userProvidedName || props.account.name

  const url = new URL("/app/transactions", BASE_URL)
  url.searchParams.set("bankAccount", props.account.id.toString())

  createEffect(() => {
    const e = keyDownEvent()
    if (e && renaming()) {
      if (e.key === "Escape") {
        setRenaming(false)
      }
    }
  })

  return (
    <div class="flex items-center">
      <Show when={props.account.plaidId}>
        <FaSolidLink class="mr-2 ml-1" title="Linked with bank" />
      </Show>
      <div>
        {props.balance.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </div>
      <Show
        when={!renaming()}
        fallback={
          <Form onSubmit={() => setRenaming(false)}>
            <input type="hidden" name="id" value={props.account.id} />
            <input
              class="outline rounded-sm my-2 ml-2 w-40"
              name="name"
              value={name()}
            />
          </Form>
        }
      >
        <A href={url.href}>
          <div class="hover:underline p-2 w-40">
            {props.account.userProvidedName || props.account.name}
          </div>
        </A>
      </Show>

      <button
        type="submit"
        title="rename"
        class={`ml-2 pl-1 self-center rounded-full p-1 ${
          renaming() ? "bg-red-300" : "bg-blue-300"
        }`}
        onClick={() => setRenaming(true)}
      >
        <Show
          when={!renaming()}
          fallback={
            <ImCancelCircle
              title="cancel renaming"
              onClick={() => setRenaming(false)}
            />
          }
        >
          <FiEdit2 size={14} />
        </Show>
      </button>
    </div>
  )
}
export default AccountRow
