import { Component, Setter, createSignal, useContext } from "solid-js"
import { CentralStoreContext } from "../App"
import { v4 as uuid } from "uuid"

interface AddTransactionFormProps {
  setEditingNewTransaction: Setter<boolean>
}

interface AddTransactionElement extends HTMLCollection {
  date: HTMLInputElement
  amount: HTMLInputElement
  payee: HTMLInputElement
  envelope: HTMLInputElement
  account: HTMLInputElement
  description: HTMLInputElement
}

export const AddTransactionForm: Component<AddTransactionFormProps> = (
  props
) => {
  const [_, { addTransaction }] = useContext(CentralStoreContext)

  return (
    <>
      <form
        id="addTransaction"
        onSubmit={(e) => {
          e.preventDefault()
          const form = document.getElementById(
            "addTransaction"
          )! as HTMLFormElement
          const elements = form.elements as AddTransactionElement
          addTransaction(uuid, {
            amount: -1 * Number.parseFloat(elements.amount.value),
            date: new Date(elements.date.value),
            payee: elements.payee.value,
            envelope: elements.envelope.value,
            account: elements.account.value,
            description: elements.description.value,
          })
          elements.amount.value = ""
          elements.date.value = ""
          elements.payee.value = ""
          elements.envelope.value = ""
          elements.account.value = ""
          elements.description.value = ""
          props.setEditingNewTransaction(false)
        }}
      />
      <div>
        <div class="box-border flex">
          <div class="w-1/12 p-0.5">
            <input
              name="amount"
              class="w-full flex-1"
              type="text"
              value=""
              form="addTransaction"
            />
          </div>
          <div class="w-1/6 p-0.5">
            <input
              name="date"
              class="w-full"
              type="date"
              form="addTransaction"
              value=""
            />
          </div>
          <div class="w-1/6 p-0.5">
            <input
              class="w-full"
              form="addTransaction"
              type="text"
              name="payee"
              value=""
            />
          </div>
          <div class="w-1/6 p-0.5">
            <input
              name="envelope"
              class="w-full"
              type="text"
              value=""
              form="addTransaction"
            />
          </div>
          <div class="w-1/6 p-0.5">
            <input
              name="account"
              class="w-full"
              type="text"
              value=""
              form="addTransaction"
            />
          </div>
          <div class="w-1/6 p-0.5">
            <input
              name="description"
              class="w-full"
              type="text"
              value=""
              form="addTransaction"
            />
          </div>
        </div>
        <button
          class="mr-4 rounded border border-blue-600 px-2 py-1"
          onClick={(e) => {
            e.preventDefault()
            props.setEditingNewTransaction(false)
          }}
        >
          cancel
        </button>
        <button
          type="submit"
          form="addTransaction"
          class="rounded border bg-blue-600 px-2 py-1 text-white"
        >
          Save
        </button>
      </div>
    </>
  )
}
