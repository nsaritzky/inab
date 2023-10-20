import { Popover } from "@kobalte/core"
import { VsClose } from "solid-icons/vs"
import { Select } from "@thisbeyond/solid-select"
import CurrencyInput from "solid-currency-input-field"
import { createServerAction$ } from "solid-start/server"
import { setAllocation } from "~/db"
import { Component, createSignal } from "solid-js"
import { Combobox } from "./Combobox"

interface Props {
  unallocated: number | undefined
  envelopeNames: string[]
  userID: string
  monthIndex: number
}

const Unallocated: Component<Props> = (props) => {
  const [allocate, setAllocate] = createSignal<number>()

  const [enrolling, { Form }] = createServerAction$(async (form: FormData) => {
    console.log(form.get("envelopeName"))
    await setAllocation(
      form.get("userID") as string,
      form.get("envelopeName") as string,
      parseInt(form.get("monthIndex") as string),
      parseFloat(form.get("amount")?.slice(1) as string),
    )
  })

  const allAllocated = () => props.unallocated == 0
  const overAllocated = () =>
    props.unallocated ? props.unallocated < 0 : false

  return (
    <div class="flex-1">
      <Popover.Root>
        <Popover.Trigger class="mx-auto">
          <div
            class={`mx-auto w-max ${
              overAllocated()
                ? "bg-red-300"
                : allAllocated()
                ? "bg-gray-300"
                : "bg-green-300"
            } rounded p-4`}
          >
            Unallocated:{" "}
            {props.unallocated?.toLocaleString("en-us", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="rounded bg-gray-50 shadow-xl">
            <Popover.Arrow />
            <Form>
              <input type="hidden" value={props.userID} name="userID" />
              <input type="hidden" value={props.monthIndex} name="monthIndex" />
              <div>Allocate</div>
              <CurrencyInput
                name="amount"
                placeholder="$0.00"
                decimalScale={2}
                intlConfig={{ locale: "en-US", currency: "USD" }}
                class="rounded p-1 border border-1 outline-none"
              />
              <div>to</div>
              <Combobox
                name="envelopeName"
                class=""
                options={props.envelopeNames}
              />
              <input type="submit" hidden />
            </Form>
            <Popover.CloseButton>
              <VsClose />
            </Popover.CloseButton>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export default Unallocated
