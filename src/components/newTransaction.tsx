import { Component, Setter, createSignal, useContext } from "solid-js"
import { CentralStoreContext } from "../App"
import { v4 as uuid } from "uuid"
import {
  SubmitHandler,
  createForm,
  pattern,
  required,
  setValue,
} from "@modular-forms/solid"
import { TextField } from "./TextField"

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

type TransactionForm = {
  amount: string
  date: string
  payee?: string | undefined
  envelope: string
  account: string
  description?: string | undefined
}

export const AddTransactionForm: Component<AddTransactionFormProps> = (
  props
) => {
  const [_, { addTransaction }] = useContext(CentralStoreContext)
  const [newTransactionFrom, { Form, Field }] = createForm<TransactionForm>({
    initialValues: { date: new Date().toISOString().split("T")[0] },
  })

  const onSubmit: SubmitHandler<TransactionForm> = (values, _) => {
    addTransaction(uuid, {
      amount: -1 * parseFloat(values.amount),
      date: new Date(values.date),
      payee: values.payee || "",
      envelope: values.envelope,
      account: values.account,
      description: values.description || "",
    })
    props.setEditingNewTransaction(false)
  }

  return (
    <Form onSubmit={onSubmit} aria-label="Edit Transaction">
      <div class="flex">
        <Field
          name="amount"
          validate={[
            required("Please enter an amount"),
            pattern(/\d+|\d*\.\d{2}/, "Badly formatted amount"),
          ]}
        >
          {(field, props) => (
            <TextField
              {...props}
              placeholder="$0.00"
              class="w-1/12 p-0.5"
              type="text"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
        <Field name="date">
          {(field, props) => (
            <TextField
              {...props}
              type="date"
              class="w-1/6 p-0.5"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
        <Field name="payee">
          {(field, props) => (
            <TextField
              {...props}
              placeholder="Payee"
              class="w-1/6 p-0.5"
              value={field.value}
              error={field.error}
            />
          )}
        </Field>
        <Field name="envelope">
          {(field, props) => (
            <TextField
              {...props}
              placeholder="Envelope"
              class="w-1/6 p-0.5"
              value={field.value}
              error={field.error}
            />
          )}
        </Field>
        <Field name="account">
          {(field, props) => (
            <TextField
              {...props}
              placeholder="Account"
              class="w-1/6 p-0.5"
              value={field.value}
              error={field.error}
            />
          )}
        </Field>
        <Field name="description">
          {(field, props) => (
            <TextField
              {...props}
              placeholder="Description"
              class="w-1/6 p-0.5"
              value={field.value}
              error={field.error}
            />
          )}
        </Field>
      </div>
      <button
        class="mr-4 w-20 rounded border border-blue-600 px-2 py-1"
        onClick={() => props.setEditingNewTransaction(false)}
      >
        Cancel
      </button>
      <button
        class="w-20 rounded border bg-blue-600 px-2 py-1 text-white"
        type="submit"
      >
        Save
      </button>
    </Form>
  )
}
