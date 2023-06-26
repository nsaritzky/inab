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
  allocated: number
}

export type Panel = "transactions" | "budget"

export interface Store {
  transactions: Transaction[]
  envelopes: Record<string, Envelope>
  accounts: string[]
  panel: Panel
}
