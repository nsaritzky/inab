import { TextField as Kobalte } from "@kobalte/core"
import { type JSX, Show, splitProps } from "solid-js"
import { Select, createOptions } from "@thisbeyond/solid-select"
import("@thisbeyond/solid-select/style.css")

type SelectFieldProps = {
  name: string
  choices: string[]
  type?: "text" | "email" | "tel" | "password" | "url" | "date" | undefined
  label?: string | undefined
  class?: string | undefined
  placeholder?: string | undefined
  value: string | undefined
  error: string
  multiline?: boolean | undefined
  required?: boolean | undefined
  disabled?: boolean | undefined
  ref: (element: HTMLInputElement | HTMLTextAreaElement) => void
  onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>
  onChange: (e: string) => void
  onBlur: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>
}

export function SelectField(props: SelectFieldProps) {
  const [rootProps, inputProps] = splitProps(props, ["value", "label", "error"])

  return (
    <div class={props.class}>
      <Select
        {...createOptions(props.choices, { createable: true })}
        onChange={props.onChange}
        disabled={props.disabled}
        initialValue={rootProps.value}
      />
    </div>
  )
}
