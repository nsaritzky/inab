export interface Transaction {
  id: string
  description: string
  payee: string
  inflow: number
  outflow: number
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

export type MonthYear = `${Month} ${Year}`

export interface Account {
  name: string
  balance: number
}

export interface Envelope {
  allocated: Record<MonthYear, number>
}

export type Panel = "transactions" | "budget"

export interface Store {
  transactions: Transaction[]
  unallocated: number
  currentMonth: MonthYear
  envelopes: Record<string, Envelope>
  accounts: string[]
  panel: Panel
}
