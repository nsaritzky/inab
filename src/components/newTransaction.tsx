import { Component, Setter, Show, createSignal, useContext } from "solid-js"
import { CentralStoreContext } from "../App"
import { v4 as uuid } from "uuid"
import {
  SubmitHandler,
  createForm,
  getValue,
  pattern,
  required,
  reset,
  setValue,
} from "@modular-forms/solid"
import { TextField } from "./TextField"
import { SelectField } from "./SelectField"
import { ToggleButton, Switch } from "@kobalte/core"

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
  inflow: boolean
}

export const AddTransactionForm: Component<AddTransactionFormProps> = (
  props
) => {
  const [state, { addTransaction }] = useContext(CentralStoreContext)
  const [inflow, setInflow] = createSignal(false)
  const [newTransactionForm, { Form, Field }] = createForm<TransactionForm>({
    initialValues: { date: new Date().toISOString().split("T")[0] },
  })

  const onSubmit: SubmitHandler<TransactionForm> = (values, _) => {
    addTransaction(uuid, {
      amount:
        (getValue(newTransactionForm, "inflow") ? 1 : -1) *
        parseFloat(values.amount),
      date: new Date(values.date),
      payee: values.payee || "",
      envelope: inflow() ? "" : values.envelope,
      account: values.account,
      description: values.description || "",
    })
    props.setEditingNewTransaction(false)
    reset(newTransactionForm)
  }

  return (
    <Form onSubmit={onSubmit} aria-label="Edit Transaction">
      <div class="mt-1 flex">
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
            <SelectField
              {...props}
              class="w-1/6"
              choices={Object.keys(state.envelopes)}
              error={field.error}
              disabled={inflow()}
              value={field.value}
              onChange={(e) => setValue(newTransactionForm, "envelope", e)}
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
        <Field name="inflow" type="boolean">
          {(field, props) => (
            <Switch.Root
              name={props.name}
              checked={field.value}
              onChange={(val) => {
                setValue(newTransactionForm, "inflow", val)
                setInflow(val)
              }}
              class="inline-flex items-center"
            >
              <Switch.Input class="peer" />
              <Switch.Control class="h-[22px] w-[44px] rounded-full border bg-red-300 outline-2 outline-blue-500 transition peer-focus:outline ui-checked:bg-green-300">
                <Switch.Thumb class="h-[20px] w-[20px] rounded-full border bg-gray-50 transition ui-checked:translate-x-[22px]" />
              </Switch.Control>
              <span class="ml-1">
                {getValue(newTransactionForm, "inflow") ? "in" : "out"}
              </span>
            </Switch.Root>
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
