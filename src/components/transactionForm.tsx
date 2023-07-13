import { Component, Setter, Show, createSignal, useContext } from "solid-js"
import { CentralStoreContext } from "../root"
import {
  SubmitHandler,
  createForm,
  getValue,
  pattern,
  reset,
  setError,
  setValue,
} from "@modular-forms/solid"
import { TextField } from "./TextField"
import { Transaction } from "@prisma/client"
import { saveTransactionFn } from "~/db"
import { Combobox } from "~/components/Combobox"
import { createServerAction$ } from "solid-start/server"

interface AddTransactionFormProps {
  setEditingNewTransaction?: Setter<boolean>
  deactivate: () => void
  txn?: Transaction | undefined
}

interface AddTransactionElement extends HTMLCollection {
  date: HTMLInputElement
  inflow: HTMLInputElement
  outflow: HTMLInputElement
  payee: HTMLInputElement
  envelope: HTMLInputElement
  account: HTMLInputElement
  description: HTMLInputElement
}

type TransactionForm = {
  id?: string | undefined
  inflow: string
  outflow: string
  date: string
  payee?: string | undefined
  envelope: string
  account: string
  description?: string | undefined
}

export const TransactionForm: Component<AddTransactionFormProps> = (props) => {
  const [state, { addTransaction, editTransaction }] =
    useContext(CentralStoreContext)!
  const [inflow, setInflow] = createSignal<string>()
  const [outflow, setOutflow] = createSignal<string>()

  const [savingTransaction, saveTransaction] =
    createServerAction$(saveTransactionFn)

  const initialValues: Partial<TransactionForm> = props.txn
    ? {
        inflow: props.txn.amount > 0 ? props.txn.amount.toString() : "",
        outflow:
          props.txn.amount < 0 ? props.txn.amount.toString().slice(1) : "",
        date: props.txn.date.toISOString().split("T")[0],
        payee: props.txn.payee || undefined,
        envelope: props.txn.envelopeName || undefined,
        description: props.txn.description || undefined,
      }
    : { date: new Date().toISOString().split("T")[0] }

  const [newTransactionForm, { Form, Field }] = createForm<TransactionForm>({
    initialValues,
  })

  const onSubmit: SubmitHandler<TransactionForm> = (values, _) => {
    if (values.inflow != "" && values.outflow != "") {
      setError(
        newTransactionForm,
        "inflow",
        "Only one of inflow or outflow should be filled in"
      )
      return
    }
    props.deactivate()
    /* editTransaction(props.txn?.id || uuid, {
     *   inflow: parseFloat(values.inflow) || 0,
     *   outflow: parseFloat(values.outflow) || 0,
     *   date: new Date(`${values.date} 00:00:01`),
     *   payee: values.payee || "",
     *   envelope: inflow() ? "" : values.envelope,
     *   account: values.account,
     *   description: values.description || "",
     * }); */
    const amount =
      (parseFloat(values.inflow) || 0) - (parseFloat(values.outflow) || 0)
    saveTransaction(
      values.envelope
        ? {
            id: props.txn?.id,
            amount,
            date: new Date(`${values.date} 00:00:01`),
            payee: values.payee,
            envelope: {
              connectOrCreate: {
                where: { name: values.envelope },
                create: { name: values.envelope },
              },
            },
            description: values.description,
          }
        : {
            id: props.txn?.id,
            amount,
            date: new Date(`${values.date} 00:00:01`),
            payee: values.payee,
            description: values.description,
          }
    )
    reset(newTransactionForm)
  }

  return (
    <Form
      onSubmit={onSubmit}
      aria-label="Edit Transaction"
      id="Edit Transaction"
      class="mt-1 table-row text-xs"
      use:clickOutside={() => {
        console.log("clickOutside")
        props.setEditingNewTransaction && props.setEditingNewTransaction(false)
      }}
    >
      <Field name="id">
        {(field, props) => <input type="hidden" value={field.value} />}
      </Field>
      <Field
        name="inflow"
        validate={[pattern(/\d+|\d*\.\d{2}/, "Badly formatted amount")]}
      >
        {(field, props) => (
          <TextField
            {...props}
            placeholder="$0.00"
            class="table-cell outline-none"
            aria-label="outflow"
            inputClass="rounded p-1 border border-1 outline-none w-12"
            type="text"
            onInput={(e) => {
              setValue(newTransactionForm, "outflow", "")
              setValue(newTransactionForm, "inflow", e.currentTarget.value)
            }}
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Field
        name="outflow"
        validate={[pattern(/\d+|\d*\.\d{2}/, "Badly formatted amount")]}
      >
        {(field, props) => (
          <TextField
            {...props}
            placeholder="$0.00"
            class="table-cell "
            inputClass=" rounded p-1 border border-1 outline-none w-12"
            type="text"
            onInput={(e) => {
              setValue(newTransactionForm, "inflow", "")
              setValue(newTransactionForm, "outflow", e.currentTarget.value)
            }}
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Field name="date">
        {(field, props) => (
          <TextField
            {...props}
            type="date"
            inputClass="rounded p-1 border border-1 outline-none w-24"
            class="table-cell"
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
            inputClass="p-1 rounded border border-1 outline-none w-16"
            class="table-cell"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      {
        <Field name="envelope">
          {(field, props) => (
            <Combobox
              {...props}
              class="table-cell w-32"
              placeholder="Envelope"
              options={Object.keys(state.envelopes)}
              error={field.error}
              disabled={getValue(newTransactionForm, "inflow") != ""}
              value={field.value}
              onChange={(e) => setValue(newTransactionForm, "envelope", e)}
            />
          )}
        </Field>
      }
      <Field name="account">
        {(field, props) => (
          <TextField
            {...props}
            placeholder="Account"
            inputClass=" rounded p-1 border border-1 outline-none w-16"
            class="table-cell"
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
            inputClass="p-1 rounded  border border-1 outline-none w-16"
            class="table-cell"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>

      <button class="hidden" type="submit" />
    </Form>
  )
}
