export interface Transaction {
  id: string
  description: string
  amount: number
  envelope: string
  account: string
  date: Date
}

export interface Account {
  name: string
  balance: number
}

export interface Envelope {
  name: string
  balance: number
}

export type Panel = "transactions" | "budget"

export interface Store {
  transactions: Transaction[]
  envelopes: Envelope[]
  accounts: Account[]
  panel: Panel
}
