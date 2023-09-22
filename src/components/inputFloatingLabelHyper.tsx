import type { Component, JSX } from "solid-js"

interface props {
  labelText: string
  inputId?: string
}

const InputFloatingLabel: Component<
  JSX.InputHTMLAttributes<HTMLInputElement> & props
> = (props) => {
  const inputId = props.inputId || props.labelText
  return (
    <label
      for={inputId}
      class="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
    >
      <input
        type="text"
        id={inputId}
        class="peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
        placeholder={props.labelText}
      />

      <span class="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
        {props.labelText}
      </span>
    </label>
  )
}

export default InputFloatingLabel
