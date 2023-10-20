import {
  Component,
  Setter,
  Show,
  createSignal,
  useContext,
  createEffect,
  createMemo,
} from "solid-js"
import CentralStoreContext from "../CentralStoreContext"
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
import { Prisma } from "@prisma/client"
import {
  editTransactionFn,
  getTransactions,
  saveNewTransactionFn,
  saveTransactionFn,
} from "~/db"
import { createServerAction$ } from "solid-start/server"
import { SelectField } from "./SelectField"
import { displayUSD } from "~/utilities"
import CurrencyInput from "solid-currency-input-field"
import Checkbox from "./Checkbox"

type Transaction = Prisma.PromiseReturnType<typeof getTransactions>[number]

interface AddTransactionFormProps {
  setEditingNewTransaction?: Setter<boolean>
  deactivate: () => void
  checked: boolean
  setChecked: (b: boolean) => void
  txn?: Transaction | undefined
  userID?: string
  envelopeList: string[]
  accountNames: string[]
  newTransaction: boolean
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

export const TransactionForm: Component<AddTransactionFormProps> = (
  TFormProps,
) => {
  const [_savingNewTransaction, saveNewTransaction] =
    createServerAction$(saveNewTransactionFn)
  const [_editingTransaction, editTransaction] =
    createServerAction$(editTransactionFn)

  const initialValues: Partial<TransactionForm> = TFormProps.txn
    ? {
        inflow:
          TFormProps.txn.amount > 0 ? TFormProps.txn.amount.toString() : "",
        outflow:
          TFormProps.txn.amount < 0
            ? TFormProps.txn.amount.toString().slice(1)
            : "",
        date: TFormProps.txn.date.toISOString().split("T")[0],
        payee: TFormProps.txn.payee || undefined,
        envelope: TFormProps.txn.envelopeName || undefined,
        account:
          TFormProps.txn.bankAccount.userProvidedName ||
          TFormProps.txn.bankAccountName ||
          undefined,
        description: TFormProps.txn.description || undefined,
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
        "Only one of inflow or outflow should be filled in",
      )
      return
    }
    TFormProps.deactivate()
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
    const data = {
      id: TFormProps.txn?.id,
      amount,
      date: new Date(`${values.date} 00:00:01`),
      payee: values.payee,
      user: { connect: { id: TFormProps.userID } },
      bankAccount: {
        connect: {
          userId_userProvidedName: {
            userId: TFormProps.userID!,
            userProvidedName: values.account,
          },
        },
      },
      envelope: values.envelope
        ? {
            connectOrCreate: {
              where: {
                name_userID: {
                  name: values.envelope,
                  userID: TFormProps.userID!,
                },
              },
              create: {
                name: values.envelope,
                userID: TFormProps.userID!,
              },
            },
          }
        : undefined,
      description: values.description,
    }
    if (data.id) {
      editTransaction({ ...data, id: data.id })
    } else {
      saveNewTransaction({ ...data, source: "user" })
    }
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
        TFormProps.setEditingNewTransaction &&
          TFormProps.setEditingNewTransaction(false)
      }}
    >
      <div class="table-cell">
        <Checkbox
          checked={TFormProps.checked}
          onChange={TFormProps.setChecked}
        />
      </div>
      <div class="table-cell"></div>
      <Field name="id">
        {(field, _) => <input type="hidden" value={field.value} />}
      </Field>
      <Field name="inflow">
        {(field, props) => (
          <div class="table-cell outline-none w-full">
            <CurrencyInput
              {...props}
              placeholder="$0.00"
              decimalsLimit={2}
              decimalScale={2}
              prefix="$"
              aria-label="inflow"
              class="rounded p-1 border border-1 outline-none w-16"
              type="text"
              onValueChange={(val) => {
                setValue(newTransactionForm, "outflow", "")
                setValue(newTransactionForm, "inflow", val || "")
              }}
              value={field.value}
            />
          </div>
        )}
      </Field>
      <Field name="outflow">
        {(field, props) => {
          const displayValue = createMemo<string | undefined>((prev) =>
            !isNaN(parseFloat(field.value || ""))
              ? field.value && displayUSD(parseFloat(field.value))
              : prev,
          )
          return (
            <div class="table-cell">
              <CurrencyInput
                {...props}
                placeholder="$0.00"
                decimalsLimit={2}
                decimalScale={2}
                prefix="$"
                class=" rounded p-1 border border-1 outline-none w-16"
                type="text"
                onValueChange={(val) => {
                  setValue(newTransactionForm, "inflow", "")
                  setValue(newTransactionForm, "outflow", val || "")
                }}
                value={field.value}
              />
            </div>
          )
        }}
      </Field>
      <Field name="date">
        {(field, props) => (
          <TextField
            {...props}
            type="date"
            inputClass="rounded p-1 border border-1 outline-none w-[5.5rem]"
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
            inputClass="p-1 rounded border border-1 outline-none w-full"
            class="table-cell"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      {
        <Field name="envelope">
          {(field, props) => (
            <SelectField
              {...props}
              class="table-cell w-32"
              placeholder="Envelope"
              createable={true}
              choices={TFormProps.envelopeList}
              error={field.error}
              disabled={getValue(newTransactionForm, "inflow") != ""}
              value={field.value}
              onChange={(value) =>
                setValue(newTransactionForm, "envelope", value)
              }
            />
          )}
        </Field>
      }
      <Field name="account">
        {(field, props) => (
          <SelectField
            {...props}
            choices={TFormProps.accountNames}
            placeholder="Account"
            class="table-cell"
            value={field.value}
            error={field.error}
            onChange={(value) => setValue(newTransactionForm, "account", value)}
          />
        )}
      </Field>
      <Field name="description">
        {(field, props) => (
          <TextField
            {...props}
            placeholder="Description"
            inputClass="p-1 rounded  border border-1 outline-none w-full"
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
