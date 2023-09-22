import { Checkbox } from "@kobalte/core"
import { splitProps, type Component } from "solid-js"
import { FaSolidCheck } from "solid-icons/fa"

interface CheckboxProps {
    checked?: boolean
    onChange?: (b: boolean) => void
    defaultChecked?: boolean
    name?: string
    styleClass?: string
}

const Export: Component<CheckboxProps> = (props) => {
    const [rootProps] = splitProps(props, [
        "checked",
        "onChange",
        "defaultChecked",
        "name",
    ])
    return (
        <Checkbox.Root {...rootProps} class="flex items-center">
            <Checkbox.Input />
            <Checkbox.Control
                class={
                    props.styleClass ||
                    "h-4 w-4 border rounded bg-white ui-checked:bg-blue-600"
                }
            >
                <Checkbox.Indicator>
                    <FaSolidCheck fill="white" />
                </Checkbox.Indicator>
            </Checkbox.Control>
        </Checkbox.Root>
    )
}

export default Export
