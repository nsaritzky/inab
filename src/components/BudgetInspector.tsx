import {
  type Accessor,
  useContext,
  createSignal,
  createEffect,
  Setter,
} from "solid-js"
import { CentralStoreContext } from "../root"
import { dateToIndex, displayUSD } from "../utilities"
import { Show } from "solid-js"
import { NewGoalForm } from "./NewGoalForm"
import { BsPlusCircle } from "solid-icons/bs"
import { Envelope, Goal, Transaction } from "@prisma/client"

interface BudgetInspectorProps {
  activeEnvelope: Envelope & {
    transactions: Transaction[]
    allocated: number[]
    goals: Goal
  }

  activeGoal: Goal | undefined
  netBalance: number
  leftoverBalance: number
  allocatedThisMonth: number
  activityThisMonth: number
  editingGoal: boolean
  setEditingGoal: Setter<boolean>
}

export const BudgetInspector = (props: BudgetInspectorProps) => {
  const [state] = useContext(CentralStoreContext)!

  const needed = () => props.activeGoal?.amount
  const funded = () => props.activeEnvelope?.allocated[state.activeMonth]

  return (
    <div class="text-md">
      <div class="mx-2">
        <div>
          <Show
            when={props.activeGoal && !props.editingGoal}
            fallback={
              <Show
                when={props.editingGoal}
                fallback={
                  <button
                    class="text-blue-500"
                    onClick={() => props.setEditingGoal(true)}
                  >
                    <div class="flex items-center">
                      <BsPlusCircle class="mr-1" />
                      Add a savings goal
                    </div>
                  </button>
                }
              >
                <NewGoalForm
                  envelope={props.activeEnvelope}
                  activeGoal={props.activeGoal}
                  cancelEditing={() => props.setEditingGoal(false)}
                />
              </Show>
            }
          >
            <div class="flex justify-between">
              <div>Amount Needed:</div>
              <div>{displayUSD(needed()!)}</div>
            </div>
            <div class="flex justify-between">
              <div>Funded:</div>
              <div>{displayUSD(funded()!)}</div>
            </div>
            <Show when={funded()! < needed()!}>
              <div class="flex justify-between">
                <div>Amount Left:</div>
                <div>{displayUSD(needed()! - funded()!)}</div>
              </div>
            </Show>
            <button
              class="text-blue-500"
              onClick={() => props.setEditingGoal(true)}
            >
              Edit
            </button>
          </Show>
        </div>
        <div class="flex justify-between">
          <span class="font-bold">Available Balance</span>
          <span>{displayUSD(props.netBalance)}</span>
        </div>
        <div class="flex justify-between">
          <span>Leftover from last month</span>
          <span>{displayUSD(props.leftoverBalance)}</span>
        </div>
        <div class="flex justify-between">
          <span>Assigned this month</span>
          <span>{displayUSD(props.allocatedThisMonth)}</span>
        </div>
        <div class="flex justify-between">
          <span>Activity</span>
          <span>{displayUSD(props.activityThisMonth)}</span>
        </div>
      </div>
    </div>
  )
}
