import { createStore } from "solid-js/store";
import type {
  Store,
  Transaction,
  Month,
  MonthYear,
  Panel,
  Goal,
  GoalStatus,
} from "./types";
import { v4 as uuid } from "uuid";
import { createEffect, createMemo } from "solid-js";
import { dateParser, dateToIndex } from "./utilities";
import { makePersisted } from "@solid-primitives/storage";
import {
  closestIndexTo,
  closestTo,
  compareDesc,
  endOfToday,
  getDay,
  getDayOfYear,
  isBefore,
  isSameMonth,
  nextDay,
  setDate,
  setDayOfYear,
} from "date-fns";

export const DAY_ONE = new Date("2023-01-01T00:00:01");
const ZEROS: number[] = Array(50).fill(0);
const TODAY = new Date();
const currentMonth =
  12 * (TODAY.getFullYear() - DAY_ONE.getFullYear()) +
  TODAY.getMonth() -
  DAY_ONE.getMonth();

const sampleTxns: Transaction[] = [
  {
    id: "0",
    description: "test",
    amount: -1,
    payee: "BuyMart",
    envelope: "Groceries",
    account: "Checking",
    date: new Date(),
  },
  {
    id: "1",
    description: "another test",
    amount: -2,
    payee: "Scrooge McDuck",
    envelope: "Rent",
    account: "Checking",
    date: new Date(),
  },
];
export const initialState: Store = {
  transactions: [],
  accounts: [],
  activeMonth: 5,
  currentMonth,
  unallocated: 0,
  envelopes: {
    Rent: {
      allocated: [0, 0, 0, 0, 0, 1000].concat(ZEROS),
      goals: [
        {
          type: "Monthly",
          amount: 700,
          begin: new Date("2023-06-01"),
          due: new Date("2023-06-15"),
        },
      ],
    },
    Groceries: {
      allocated: [0, 0, 0, 0, 0, 300].concat(ZEROS),
      goals: [],
    },
  },
  // panel: "transactions",
};

const [state, setState] = createStore(initialState);
if (state.activeMonth > ZEROS.length) {
  setState("activeMonth", 0);
}

export const createCentralStore = () => {
  const addTransaction = (
    idFn: () => string,
    {
      inflow,
      outflow,
      date,
      payee,
      envelope,
      account,
      description,
    }: Omit<Transaction, "id" | "amount"> & { inflow: number; outflow: number }
  ) => {
    const amount = inflow - outflow;
    if (amount > 0) {
      setState("unallocated", (old) => old + amount);
    }
    setState("transactions", (txns) => [
      ...txns,
      { id: idFn(), amount, date, payee, envelope, account, description },
    ]);
    if (!Object.keys(state.envelopes).includes(envelope)) {
      setState("envelopes", envelope, { allocated: ZEROS, goals: [] });
    }
  };

  const editTransaction = (
    id: string | (() => string),
    {
      inflow,
      outflow,
      date,
      payee,
      envelope,
      account,
      description,
    }: Omit<Transaction, "id" | "amount"> & { inflow: number; outflow: number }
  ) => {
    const newAmount = inflow - outflow;
    if (typeof id == "string") {
      const txn = state.transactions.filter((t) => t.id == id)[0];
      const oldAmount = txn.amount;
      if (newAmount > oldAmount) {
        setState("unallocated", (old) => old - oldAmount + newAmount);
      }
      setState(
        "transactions",
        (t) => t.id == id,
        () => ({
          amount: newAmount,
          date,
          payee,
          envelope,
          account,
          description,
        })
      );
    } else {
      if (newAmount > 0) {
        setState("unallocated", (old) => old + newAmount);
      }
      setState("transactions", (txns) => [
        ...txns,
        {
          id: id(),
          amount: newAmount,
          date,
          payee,
          envelope,
          account,
          description,
        },
      ]);
    }
    if (!Object.keys(state.envelopes).includes(envelope)) {
      setState("envelopes", envelope, { allocated: ZEROS, goals: [] });
    }
  };

  const deleteTransaction = (id: string) =>
    setState("transactions", (txns) => txns.filter((t) => t.id != id));

  const allocate = (envelope: string, month: number, value: number) => {
    const oldValue: number = state.envelopes[envelope].allocated[month] || 0;
    setState("envelopes", envelope, "allocated", month, value);
    setState("unallocated", (old) => old - value + oldValue);
  };

  const envelopeBalances = createMemo(() => {
    const result: Record<string, number> = {};
    for (const nm of Object.keys(state.envelopes)) {
      const activity = state.transactions
        .filter(
          (txn) =>
            txn.envelope == nm && dateToIndex(txn.date) == state.activeMonth
        )
        .reduce((sum, txn) => sum + txn.amount, 0);
      Object.assign(result, { [nm]: activity });
    }
    return result;
  });

  const monthlyBalances = createMemo(() =>
    Object.fromEntries(
      Object.entries(state.envelopes).map(([nm, envlp]) => [
        nm,
        envlp.allocated.map(
          (x, i) =>
            x +
            state.transactions
              .filter((txn) => dateToIndex(txn.date) == i && txn.envelope == nm)
              .reduce((sum, txn) => sum + txn.amount, 0)
        ),
      ])
    )
  );

  const netBalance = createMemo(() =>
    Object.fromEntries(
      Object.entries(monthlyBalances()).map(([nm, balances]) => [
        nm,
        balances.map((_, i) =>
          balances.slice(0, i + 1).reduce((a, b) => a + b, 0)
        ),
      ])
    )
  );

  const accountBalances = createMemo(() => {
    const result: Record<string, number> = {};
    for (const nm of state.accounts) {
      const spent = state.transactions
        .filter((txn) => txn.account == nm)
        .reduce((sum, txn) => sum + txn.amount, 0);
      Object.assign(result, { [nm]: spent });
    }
    return result;
  });

  const setGoal = (envelope: string, goal: Goal): void => {
    setState("envelopes", envelope, "goals", (goals) => [
      ...goals.filter((g) => !isSameMonth(g.begin, goal.begin)),
      goal,
    ]);
  };

  const deleteGoal = (envelope: string, goal: Goal | undefined): void => {
    setState("envelopes", envelope, "goals", (goals) =>
      goals.filter((g) => g.due != goal?.due)
    );
  };

  const getGoalAsOf = createMemo(
    () =>
      (envelope: string, date: Date): Goal | undefined => {
        const earlierGoals = state.envelopes[envelope].goals.filter((g) =>
          isBefore(g.begin, date)
        );
        const i = closestIndexTo(
          date,
          earlierGoals.map((g) => g.begin)
        );
        return i != undefined ? earlierGoals[i] : undefined;
      }
  );

  const updateGoalDueDate = (envelope: string, date: Date) => {
    const g = getGoalAsOf()(envelope, date);
    if (g) {
      let newDueDate: Date;
      switch (g.type) {
        case "Weekly": {
          newDueDate = nextDay(date, getDay(g.due));
        }
        case "Monthly": {
          newDueDate = setDate(date, g.due.getDate());
        }
        case "Yearly":
          {
            newDueDate = setDayOfYear(date, getDayOfYear(g.due));
          }
          setState(
            "envelopes",
            envelope,
            "goals",
            (goal) => goal == getGoalAsOf()(envelope, date),
            (goal) => ({ ...goal, due: newDueDate })
          );
      }
    }
  };

  const getGoalStatus = (
    envelope: string,
    date: Date
  ): GoalStatus | undefined => {
    const g = getGoalAsOf()(envelope, date);
    if (g) {
      let dueDate: Date;
      switch (g.type) {
        case "Weekly": {
          dueDate = nextDay(date, getDay(g.due));
        }
        case "Monthly": {
          dueDate = setDate(date, g.due.getDate());
        }
        case "Yearly": {
          dueDate = setDayOfYear(date, getDayOfYear(g.due));
        }
      }
      if (
        state.envelopes[envelope].allocated[dateToIndex(endOfToday())] >=
        g.amount
      ) {
        return "green";
      } else {
        if (isBefore(dueDate, endOfToday())) {
          return "yellow";
        } else {
          return "red";
        }
      }
    }
  };

  const setIncMonth = () => setState("activeMonth", (n) => n + 1);
  const setDecMonth = () => setState("activeMonth", (n) => n - 1);
  const setMonth = (i: number) => setState("activeMonth", i);

  // const setPanel = (panel: Panel) => setState("panel", panel);

  return [
    state,
    {
      allocate,
      addTransaction,
      editTransaction,
      deleteTransaction,
      envelopeBalances,
      monthlyBalances,
      netBalance,
      accountBalances,
      setGoal,
      deleteGoal,
      getGoalAsOf,
      getGoalStatus,
      setIncMonth,
      setDecMonth,
      setMonth,
      // setPanel,
      dateToIndex,
    },
  ] as const;
};
