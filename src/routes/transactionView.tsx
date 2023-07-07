import { For, Show, createEffect, createSignal, useContext } from "solid-js";
import { TransactionForm } from "~/components/transactionForm";
import { TransactionRow } from "~/components//transactionRow";
import { AiOutlinePlusCircle } from "solid-icons/ai";
import { CentralStoreContext } from "../root";
import { sort } from "@solid-primitives/signal-builders";

const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)!;
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal<number>();

  return (
    <div class="ml-64 w-auto">
      <div class="ml-4 mt-4 text-sm">
        <button
          onClick={(e) => {
            e.preventDefault();
            setEditingNewTransaction(true);
          }}
        >
          <div class="flex">
            <AiOutlinePlusCircle size={24} /> Add transaction
          </div>
        </button>
        <div
          class="table w-auto table-fixed divide-y"
          role="table"
          aria-label="Transactions"
        >
          <div class="flex table-header-group text-left" role="row">
            <div class="table-cell w-14">Inflow</div>
            <div class="table-cell w-14">Outflow</div>
            <div class="table-cell w-28">Date</div>
            <div class="table-cell w-20">Payee</div>
            <div class="table-cell w-36">Envelope</div>
            <div class="table-cell w-20">Account</div>
            <div class="table-cell w-20">Description</div>
          </div>
          <Show when={editingNewTransaction()}>
            <TransactionForm
              setEditingNewTransaction={setEditingNewTransaction}
              deactivate={() => setEditingNewTransaction(false)}
            />
          </Show>
          <For
            each={sort(
              state.transactions,
              (a, b) => a.date.getDate() - b.date.getDate()
            )()}
          >
            {(txn, i) => (
              <TransactionRow
                txn={txn}
                active={activeIndex() == i()}
                activate={() => setActiveIndex(i())}
                deactivate={() => setActiveIndex(-1)}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
