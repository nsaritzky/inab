export interface Transaction {
  id: string
  description: string
  payee: string
  amount: number
  envelope: string
  account: string
  date: Date
}

export type Month =
  | "JAN"
  | "FEB"
  | "MAR"
  | "APR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AUG"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DEC"

type Year = number

export type GoalType = "Monthly" | "Yearly" | "Weekly"
export type Goal = { type: GoalType; amount: number; begin: Date; due: Date }
export type GoalStatus = "green" | "yellow" | "red"

export type MonthYear = `${Month} ${Year}`

export interface Account {
  name: string
  balance: number
}

export interface Envelope {
  allocated: number[]
  goals: Goal[]
}

export type Panel = "transactions" | "budget" | "accounts"

export interface Store {
  transactions: Transaction[]
  unallocated: number
  activeMonth: number
  currentMonth: number
  envelopes: Record<string, Envelope>
  accounts: string[]
  // panel: Panel
}
