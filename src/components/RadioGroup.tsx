import { RadioGroup as Kobalte } from "@kobalte/core"
import { type JSX, Show, splitProps, For } from "solid-js"

type RadioGroupProps = {
  name: string
  label?: string | undefined
  options: { label: string; value: string }[]
  value: string | undefined
  error: string
  required?: boolean | undefined
  disabled?: boolean | undefined
  ref: (element: HTMLInputElement | HTMLTextAreaElement) => void
  onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>
}

export function RadioGroup(props: RadioGroupProps) {
  const [rootProps, inputProps] = splitProps(
    props,
    ["name", "value", "required", "disabled"],
    ["ref", "onInput", "onChange", "onBlur"]
  )
  return (
    <Kobalte.Root
      {...rootProps}
      orientation="horizontal"
      class="flex justify-between"
      validationState={props.error ? "invalid" : "valid"}
    >
      <Show when={props.label}>
        <Kobalte.Label>{props.label}</Kobalte.Label>
      </Show>

      <For each={props.options}>
        {(option) => (
          <Kobalte.Item value={option.value} class="m-2 flex items-center">
            <Kobalte.ItemInput {...inputProps} />
            <Kobalte.ItemControl class="mr-2 flex h-4 w-4 items-center justify-center rounded-full border bg-slate-200 ui-checked:bg-blue-500">
              <Kobalte.ItemIndicator class="h-1.5 w-1.5 rounded-full bg-white" />
            </Kobalte.ItemControl>
            <Kobalte.ItemLabel>{option.label}</Kobalte.ItemLabel>
          </Kobalte.Item>
        )}
      </For>

      <Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
    </Kobalte.Root>
  )
}
/*
 * ;<RadioGroup.Root
 *   orientation="horizontal"
 *   class="flex justify-between"
 *   onChange={setGoalFrequency}
 *   value={field.value}
 * >
 *   <For each={["Monthly", "Weekly", "Yearly"]}>
 *     {(frequency) => (
 *       <RadioGroup.Item value={frequency} class="m-2 flex items-center">
 *         <RadioGroup.ItemInput />
 *         <RadioGroup.ItemControl class="mr-2 flex h-4 w-4 items-center justify-center rounded-full border bg-slate-200 ui-checked:bg-blue-500">
 *           <RadioGroup.ItemIndicator class="h-1.5 w-1.5 rounded-full bg-white" />
 *         </RadioGroup.ItemControl>
 *         <RadioGroup.ItemLabel>{frequency}</RadioGroup.ItemLabel>
 *       </RadioGroup.Item>
 *     )}
 *   </For>
 * </RadioGroup.Root> */
