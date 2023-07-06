import { Select as Kobalte } from "@kobalte/core"
import {
  type JSX,
  Show,
  splitProps,
  createSignal,
  createEffect,
} from "solid-js"
import { FaSolidCheck } from "solid-icons/fa"

type Option = {
  label: string
  value: string
}

type SelectProps = {
  name: string
  label?: string | undefined
  placeholder?: string | undefined
  options: Option[]
  value: string | undefined
  error: string
  required?: boolean | undefined
  disabled?: boolean | undefined
  ref: (element: HTMLSelectElement) => void
  onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>
  onChange: JSX.EventHandler<HTMLSelectElement, Event>
  onBlur: JSX.EventHandler<HTMLSelectElement, FocusEvent>
}

export function Select(props: SelectProps) {
  const [rootProps, selectProps] = splitProps(
    props,
    ["name", "placeholder", "options", "required", "disabled"],
    ["placeholder", "ref", "onInput", "onChange", "onBlur"]
  )
  const [getValue, setValue] = createSignal<Option>()
  createEffect(() => {
    setValue(props.options.find((option) => props.value === option.value))
  })
  return (
    <Kobalte.Root
      {...rootProps}
      multiple={false}
      value={getValue()}
      onChange={setValue}
      optionValue="value"
      optionTextValue="label"
      validationState={props.error ? "invalid" : "valid"}
      itemComponent={(props) => (
        <Kobalte.Item
          item={props.item}
          class="flex items-center justify-between rounded ui-highlighted:bg-blue-500 ui-highlighted:text-white"
        >
          <Kobalte.ItemLabel class="ml-2">
            {props.item.textValue}
          </Kobalte.ItemLabel>
          <Kobalte.ItemIndicator class="mr-2">
            <FaSolidCheck />
          </Kobalte.ItemIndicator>
        </Kobalte.Item>
      )}
    >
      <Show when={props.label}>
        <Kobalte.Label>{props.label}</Kobalte.Label>
      </Show>
      <Kobalte.HiddenSelect {...selectProps} />
      <Kobalte.Trigger class="mx-auto flex w-32 justify-between rounded border px-2 py-1">
        <Kobalte.Value<Option>>
          {(state) => state.selectedOption().label}
        </Kobalte.Value>
        <Kobalte.Icon>{/* Add SVG icon here */}</Kobalte.Icon>
      </Kobalte.Trigger>
      <Kobalte.Portal>
        <Kobalte.Content class="bg-white shadow-lg">
          <Kobalte.Listbox />
        </Kobalte.Content>
      </Kobalte.Portal>
      <Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
    </Kobalte.Root>
  )
}
