import {
  type Accessor,
  useContext,
  createSignal,
  createEffect,
  Setter,
} from "solid-js";
import { CentralStoreContext } from "../root";
import { dateToIndex, displayUSD } from "../utilities";
import { Show } from "solid-js";
import { NewGoalForm } from "./NewGoalForm";
import { BsPlusCircle } from "solid-icons/bs";

interface BudgetInspectorProps {
  activeEnvelope: string;
  editingGoal: boolean;
  setEditingGoal: Setter<boolean>;
}

export const BudgetInspector = (props: BudgetInspectorProps) => {
  const [state, { netBalance, getGoalAsOf, getGoalStatus }] =
    useContext(CentralStoreContext)!;

  const activeGoal = () => getGoalAsOf()(props.activeEnvelope, new Date());
  const needed = () => activeGoal()?.amount;
  const funded = () =>
    state.envelopes[props.activeEnvelope].allocated[state.activeMonth];

  return (
    <div class="text-md">
      <div class="mx-2">
        <div>
          <Show
            when={activeGoal() && !props.editingGoal}
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
              <div>{displayUSD(funded())}</div>
            </div>
            <Show when={funded() < needed()!}>
              <div class="flex justify-between">
                <div>Amount Left:</div>
                <div>{displayUSD(needed()! - funded())}</div>
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
          <span>
            {displayUSD(netBalance()[props.activeEnvelope!][state.activeMonth])}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Leftover from last month</span>
          <span>
            {displayUSD(
              netBalance()[props.activeEnvelope!][state.activeMonth - 1]
            )}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Assigned this month</span>
          <span>
            {displayUSD(
              state.envelopes[props.activeEnvelope!].allocated[
                state.activeMonth
              ]
            )}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Activity</span>
          <span>
            {displayUSD(
              state.transactions
                .filter((txn) => dateToIndex(txn.date) == state.activeMonth)
                .filter((txn) => txn.envelope === props.activeEnvelope)
                .reduce((sum, txn) => sum + txn.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
