import { TextField as Kobalte } from "@kobalte/core"
import { type JSX, Show, splitProps } from "solid-js"

type TextFieldProps = {
  name: string
  ariaLabel?: string
  type?: "text" | "email" | "tel" | "password" | "url" | "date" | undefined
  label?: string | undefined
  class?: string
  inputClass?: string
  placeholder?: string | undefined
  value: string | undefined
  error: string
  multiline?: boolean | undefined
  required?: boolean | undefined
  disabled?: boolean | undefined
  ref: (element: HTMLInputElement | HTMLTextAreaElement) => void
  onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>
  onChange: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>
  onBlur: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>
}

export function TextField(props: TextFieldProps) {
  const [rootProps, inputProps] = splitProps(
    props,
    ["name", "class", "value", "required", "disabled"],
    ["aria-label", "placeholder", "ref", "onInput", "onChange", "onBlur"]
  )
  return (
    <Kobalte.Root
      {...rootProps}
      validationState={props.error ? "invalid" : "valid"}
    >
      <Show when={props.label}>
        <Kobalte.Label class="mr-2">{props.label}</Kobalte.Label>
      </Show>
      <Show
        when={props.multiline}
        fallback={
          <Kobalte.Input
            {...inputProps}
            class={props.inputClass}
            type={props.type}
          />
        }
      >
        <Kobalte.TextArea {...inputProps} autoResize />
      </Show>
      <Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
    </Kobalte.Root>
  )
}
