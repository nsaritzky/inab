import { z } from "zod"
import { createForm } from "@modular-forms/solid"

const withInflow = z.object({
  inflow: z.coerce.number(),
  outflow: z.coerce.number().lte(0).gte(0),
  date: z.coerce.date(),
  payee: z.string(),
  envelope: z.string(),
  account: z.string(),
  description: z.string(),
})

const withOutflow = z.object({
  inflow: z.coerce.number().lte(0).gte(0),
  outflow: z.coerce.number(),
  date: z.coerce.date(),
  payee: z.string(),
  envelope: z.string(),
  account: z.string(),
  description: z.string(),
})

const formSchema = z.union([withInflow, withOutflow])
type FormType = z.infer<typeof formSchema>

export const [transactionForm, { Form, Field }] = createForm<FormType>()
