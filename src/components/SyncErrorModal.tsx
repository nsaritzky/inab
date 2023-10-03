import { Dialog } from "@kobalte/core"
import { type Component, createSignal, Setter } from "solid-js"
import { A } from "solid-start"

interface Props {
  dialogOpen: boolean
  setDialogOpen: Setter<boolean>
  itemId?: string
}

const ErrorModal: Component<Props> = (props) => {
  return (
    <Dialog.Root
      open={props.dialogOpen}
      onOpenChange={props.setDialogOpen}
      modal
    >
      <Dialog.Portal>
        <Dialog.Overlay class="bg-black/20 inset-0 fixed" />
        <div class="inset-0 fixed flex justify-center items-center">
          <Dialog.Content class="bg-white p-4 shadow rounded">
            <div class="flex justify-between">
              <Dialog.Title>Hello</Dialog.Title>
              <Dialog.CloseButton>x</Dialog.CloseButton>
            </div>
            <Dialog.Description>
              The connection to your bank account has expired. Click{" "}
              <A href={`/plaid?accountId=${props.itemId}`}>here</A> to reconnect
              it.
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ErrorModal
