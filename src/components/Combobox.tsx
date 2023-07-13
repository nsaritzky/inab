import { Combobox as Kobalte, createFilter } from "@kobalte/core"
import { FaSolidCheck } from "solid-icons/fa"
import {
  type JSX,
  Show,
  splitProps,
  createSignal,
  createEffect,
} from "solid-js"

type ComboProps = {
  name: string
  label?: string | undefined
  class: string | undefined
  placeholder?: string | undefined
  options: string[]
  value: string | undefined
  error: string
  required?: boolean | undefined
  disabled?: boolean | undefined
  ref: (element: HTMLSelectElement) => void
  onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>
  onChange: JSX.EventHandler<HTMLSelectElement, Event>
  onBlur: JSX.EventHandler<HTMLSelectElement, FocusEvent>
}

export const Combobox = (props: ComboProps) => {
  const [rootProps, inputProps] = splitProps(
    props,
    ["name", "placeholder", "options", "required", "disabled"],
    ["onInput", "onChange", "onBlur"]
  )
  const [getValue, setValue] = createSignal<string>()

  const filter = createFilter({ sensitivity: "base" })

  const onOpenChange = (
    isOpen: boolean,
    triggerMode?: Kobalte.ComboboxTriggerMode
  ) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptions(props.options)
    }
  }

  const onInputChange = (value: string) => {
    setOptions(props.options.filter((option) => filter.contains(option, value)))
  }

  const [options, setOptions] = createSignal<string[]>(props.options)

  createEffect(() => {
    setValue(props.options.find((option) => props.value === option))
  })

  return (
    <Kobalte.Root
      {...rootProps}
      multiple={false}
      value={getValue()}
      onChange={setValue}
      onInputChange={onInputChange}
      onOpenChange={onOpenChange}
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
      <Kobalte.HiddenSelect {...inputProps} />
      <Kobalte.Control>
        <Kobalte.Trigger class="mx-auto flex w-32 justify-between rounded border px-2 py-1">
          <Kobalte.Input />
          <Kobalte.Icon />
        </Kobalte.Trigger>
      </Kobalte.Control>
      <Kobalte.Portal>
        <Kobalte.Content class="bg-white shadow-lg">
          <Kobalte.Listbox />
        </Kobalte.Content>
      </Kobalte.Portal>
    </Kobalte.Root>
  )
}
