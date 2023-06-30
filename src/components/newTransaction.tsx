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
  setError,
  setValue,
} from "@modular-forms/solid"
import { TextField } from "./TextField"
import { SelectField } from "./SelectField"
import { ToggleButton, Switch } from "@kobalte/core"
import { clickOutside } from "../utilities"

interface AddTransactionFormProps {
  setEditingNewTransaction: Setter<boolean>
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
  inflow: string
  outflow: string
  date: string
  payee?: string | undefined
  envelope: string
  account: string
  description?: string | undefined
}

export const AddTransactionForm: Component<AddTransactionFormProps> = (
  props
) => {
  const [state, { addTransaction }] = useContext(CentralStoreContext)
  const [inflow, setInflow] = createSignal<string>()
  const [outflow, setOutflow] = createSignal<string>()
  const [newTransactionForm, { Form, Field }] = createForm<TransactionForm>({
    initialValues: { date: new Date().toISOString().split("T")[0] },
  })

  const onSubmit: SubmitHandler<TransactionForm> = (values, _) => {
    if (values.inflow != "" && values.outflow != "") {
        setError(newTransactionForm, "inflow", "Only one of inflow or outflow should be filled in")
        return
    }
    props.setEditingNewTransaction(false)
    reset(newTransactionForm)
    addTransaction(uuid, {
      inflow: parseFloat(values.inflow) || 0,
      outflow: parseFloat(values.outflow) || 0,
      date: new Date(values.date),
      payee: values.payee || "",
      envelope: inflow() ? "" : values.envelope,
      account: values.account,
      description: values.description || "",
    })
  }

  return (
        <Form
            onSubmit={onSubmit}
            aria-label="Edit Transaction"
            id="Edit Transaction"
            class="mt-1 table-row text-xs"
            use: clickOutside={() => {
                console.log("clickOutside")
                props.setEditingNewTransaction(false)
            }}
        >
            <Field
                name="inflow"
                validate={[
                    pattern(/\d+|\d*\.\d{2}/, "Badly formatted amount"),
                ]}
            >
                {(field, props) => (
                    <TextField
                        {...props}
                        placeholder="$0.00"
                        class="table-cell p-1 outline-none"
                      inputClass=" rounded p-1 border border-1 outline-none"
                        type="text"
                        onInput={(e) => { setValue(newTransactionForm, "outflow", "")
                        setValue(newTransactionForm, "inflow", e.currentTarget.value)}}
                        value={field.value}
                        error={field.error}
                    />
                )}
            </Field>
            <Field
                name="outflow"
                validate={[
                    pattern(/\d+|\d*\.\d{2}/, "Badly formatted amount"),
                ]}
            >
                {(field, props) => (
                    <TextField
                        {...props}
                        placeholder="$0.00"
                        class="table-cell  p-1"
                        inputClass=" rounded p-1 border border-1 outline-none"
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
                        inputClass="rounded p-1 border border-1 outline-none"

                        class="table-cell  p-1"
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
                        inputClass="p-1 rounded border border-1 outline-none"

                        class="table-cell p-1"
                        value={field.value}
                        error={field.error}
                    />
                )}
            </Field>
            <Field name="envelope">
                {(field, props) => (
                    <SelectField
                        {...props}
                        class="table-cell"
                        placeholder="Envelope"
                        choices={Object.keys(state.envelopes)}
                        error={field.error}
                        disabled={getValue(newTransactionForm, "inflow") != ""}
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
                        inputClass=" rounded p-1 border border-1 outline-none"

                        class="table-cell p-1"
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
                        inputClass="p-1 rounded  border border-1 outline-none"

                        class="table-cell  p-1"
                        value={field.value}
                        error={field.error}
                    />
                )}
            </Field>

            <button class="hidden" type="submit" />
        </Form>
    )
}
