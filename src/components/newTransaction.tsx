import { addTransaction } from "../store"

interface AddTransactionElement extends HTMLCollection {
  date: HTMLInputElement
  amount: HTMLInputElement
  payee: HTMLInputElement
  envelope: HTMLInputElement
  account: HTMLInputElement
  description: HTMLInputElement
}

export const AddTransactionForm = () => (
  <>
    <form id="addTransaction" />
    <tr class="">
      <td>
        <input
          name="amount"
          class="w-full"
          type="text"
          value=""
          pattern="\d+(\.\d{2})?|\.\d{2}"
          form="addTransaction"
        />
      </td>
      <td>
        <input
          name="date"
          class="w-full"
          type="date"
          form="addTransaction"
          value=""
        />
      </td>
      <td>
        <input
          class="w-full"
          form="addTransaction"
          type="text"
          name="payee"
          value=""
        />
      </td>
      <td>
        <input
          name="envelope"
          class="w-full"
          type="text"
          value=""
          form="addTransaction"
        />
      </td>
      <td>
        <input
          name="account"
          class="w-full"
          type="text"
          value=""
          form="addTransaction"
        />
      </td>
      <td>
        <input
          name="description"
          class="w-full"
          type="text"
          value=""
          form="addTransaction"
        />
      </td>
      <td>
        <button
          type="submit"
          form="addTransaction"
          onClick={(e) => {
            e.preventDefault()
            const form = document.getElementById(
              "addTransaction"
            )! as HTMLFormElement
            const elements = form.elements as AddTransactionElement
            addTransaction({
              amount: -1 * Number.parseFloat(elements.amount.value),
              date: new Date(elements.date.value),
              payee: elements.payee.value,
              envelope: elements.envelope.value,
              account: elements.account.value,
              description: elements.description.value,
            })
            elements.amount.value = ""
            elements.date.value = ""
            elements.payee.value = ""
            elements.envelope.value = ""
            elements.account.value = ""
            elements.description.value = ""
          }}
        >
          add
        </button>
      </td>
    </tr>
  </>
)
