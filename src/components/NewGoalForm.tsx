import {
  SubmitHandler,
  createForm,
  getValue,
  required,
  setValue,
  setValues,
} from "@modular-forms/solid"
import type { GoalType } from "../types"
import {
  nextDay,
  type Day,
  setDate,
  endOfToday,
  setDayOfYear,
  setMonth,
  startOfToday,
  getDay,
  getDate,
  getMonth,
} from "date-fns"
import { TextField } from "./TextField"
import {
  For,
  Match,
  Switch,
  createEffect,
  createSignal,
  useContext,
} from "solid-js"
import { getOrdinal } from "../utilities"
import { Select } from "./Select"
import CentralStoreContext from "~/CentralStoreContext"
import { RadioGroup } from "./RadioGroup"
import { Envelope, Goal } from "@prisma/client"
import { deleteGoalFn, updateGoalFn } from "~/db"
import { createServerAction$ } from "solid-start/server"

interface Props {
  envelope: Envelope & { goals: Goal[] }
  activeGoal: Goal | undefined
  cancelEditing: () => void
  userID: string
}

type Frequency = "Monthly" | "Yearly" | "Weekly"

const frequencyOptions = ["Monthly", "Weekly", "Yearly"].map((s) => ({
  value: s,
  label: s,
}))

const daysOfMonth = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
].map((n) => ({ label: `${n}${getOrdinal(n)}`, value: `${n}` }))

const daysOfTheWeek = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuseday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const monthOptions = months.map((s) => ({ value: s, label: s }))

/* type DayOfMonth = (typeof daysOfMonth)[number] */

type NewGoalForm = {
  amount: string
  frequency: Frequency
  weekly: {
    due: string
  }
  monthly: {
    due: string
  }
  yearly: {
    month: string
    day: string
  }
}

const getInitialValues = (
  goal: Goal | undefined,
): Partial<NewGoalForm> | undefined =>
  goal
    ? {
        amount: goal.amount.toString(),
        frequency: goal.type as Frequency,
        weekly:
          goal.type === "Weekly"
            ? {
                due: getDay(goal.due).toString(),
              }
            : undefined,

        monthly:
          goal.type == "Monthly"
            ? {
                due: getDate(goal.due).toString(),
              }
            : undefined,

        yearly:
          goal.type === "Yearly"
            ? {
                month: months[getMonth(goal.due)],
                day: getDate(goal.due).toString(),
              }
            : undefined,
      }
    : undefined

export const NewGoalForm = (props: Props) => {
  const now = new Date()
  const [state] = useContext(CentralStoreContext)!
  /* const existingGoal = () => getGoalAsOf()(props.envelope, now) */

  const formDefaults = {
    frequency: "Monthly" as const,
    monthly: { due: getDate(now).toString() },
    weekly: { due: getDay(now).toString() },
    yearly: {
      month: months[getMonth(now)],
      day: getDate(now).toString(),
    },
  }
  const initialValues = getInitialValues(props.activeGoal) || formDefaults
  const [goalForm, { Form, Field }] = createForm<NewGoalForm>({
    initialValues,
  })

  const [goalFrequency, setGoalFrequency] = createSignal(
    initialValues.frequency,
  )

  const [deletingGoal, deleteGoal] = createServerAction$(deleteGoalFn)

  const [updatingGoal, updateGoal] = createServerAction$(updateGoalFn)

  const onSubmit: SubmitHandler<NewGoalForm> = (values, event) => {
    let dueDate: Date
    switch (values.frequency) {
      case "Weekly":
        dueDate = nextDay(endOfToday(), parseInt(values.weekly.due) as Day)
        break
      case "Monthly":
        dueDate = setDate(endOfToday(), parseInt(values.monthly.due))
        break
      case "Yearly":
        dueDate = setDate(
          setMonth(endOfToday(), months.indexOf(values.yearly.month)),
          parseInt(values.yearly.day),
        )
        break
    }
    /* setGoal(props.envelope, {
     *   type: values.frequency,
     *   amount: parseFloat(values.amount),
     *   begin: startOfToday(),
     *   due: dueDate,
     * }) */
    updateGoal({
      type: values.frequency,
      amount: parseFloat(values.amount),
      begin: state.activeMonth,
      due: dueDate,
      envelopeName: props.envelope.name,
      userID: props.userID,
    })
    props.cancelEditing()
  }

  return (
    <Form onSubmit={onSubmit}>
      <Field name="amount" validate={required("Please enter an amount")}>
        {(field, props) => (
          <TextField
            {...props}
            label="Amount"
            inputClass="outline-none rounded px-1 outline outline-blue-400 m-1"
            value={field.value}
            error={field.error}
            required
          />
        )}
      </Field>
      <Field name="frequency" validate={required("Pick a frequency")}>
        {(field, props) => (
          <RadioGroup
            {...props}
            options={frequencyOptions}
            value={field.value}
            error={field.error}
            onChange={(e) =>
              setGoalFrequency(e.currentTarget.value as Frequency)
            }
          />
        )}
      </Field>
      <Switch>
        <Match when={goalFrequency() === "Monthly"}>
          <Field name="monthly.due">
            {(field, props) => (
              <Select
                {...props}
                placeholder="Pick a day "
                options={daysOfMonth}
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
        </Match>
        <Match when={goalFrequency() === "Weekly"}>
          <Field name="weekly.due">
            {(field, props) => (
              <Select
                {...props}
                placeholder="Pick a day"
                options={daysOfTheWeek}
                value={field.value}
                error={field.error}
              />
            )}
          </Field>
        </Match>
        <Match when={goalFrequency() === "Yearly"}>
          <div class="flex justify-center">
            <Field name="yearly.month">
              {(field, props) => (
                <Select
                  {...props}
                  placeholder="Month"
                  options={monthOptions}
                  value={field.value}
                  error={field.error}
                />
              )}
            </Field>
            <Field name="yearly.day">
              {(field, props) => (
                <Select
                  {...props}
                  placeholder="Day"
                  options={daysOfMonth}
                  value={field.value}
                  error={field.error}
                />
              )}
            </Field>
          </div>
        </Match>
      </Switch>
      <div class="mt-2 flex justify-between">
        <button
          onClick={() => {
            deleteGoal(props.envelope.name)
            props.cancelEditing()
          }}
          class="rounded bg-red-500 p-1 text-white"
        >
          Delete
        </button>
        <div class="flex justify-end">
          <button
            type="button"
            onClick={props.cancelEditing}
            class="mr-2 rounded p-1 text-blue-500 outline outline-1 outline-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded bg-blue-500 p-1 text-white disabled:bg-gray-100 disabled:text-black"
          >
            Submit
          </button>
        </div>
      </div>
    </Form>
  )
}
