import { Control, Controller } from "react-hook-form"
import { PropertiesProps } from "./types"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import { ReactNode } from "react"

function PropertyContainer({ onClick, children }: { onClick: () => void, children: ReactNode }) {

    return (
        <div onClick={onClick} className="flex items-center gap-x-3 cursor-pointer"  >
            {children}
        </div >

    )
}

export type PropertiesRequiredProps =
    {
        name: keyof PropertiesProps
        type: "Switch"
        control: Control<PropertiesProps, any>
        defaultValue: boolean
        switchCheckedOnChange: (checked: boolean) => void
        textField: true
        textFieldDefaultValue: string | undefined
        textFieldOnChange: (e: string) => void
        textFieldName: keyof PropertiesProps

    } |
    {
        name: keyof PropertiesProps
        type: "Switch"
        control: Control<PropertiesProps, any>
        defaultValue: boolean
        switchCheckedOnChange: (checked: boolean) => void
        textField: false

    } |
    {
        label: string
        type: "Button"
        icon: ReactNode
        onClick: () => void
    }

export function Property({ ...props }: PropertiesRequiredProps) {
    const { type } = props


    return (
        <>
            {type === "Switch" &&
                <Controller
                    control={props.control}
                    name={props.name}
                    defaultValue={props.defaultValue}
                    render={({ field }) => (

                        <>
                            <PropertyContainer onClick={() => field.onChange(!field.value)}>
                                <Switch
                                    name={field.name}
                                    checked={field.value as boolean}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        props.switchCheckedOnChange(checked)
                                    }}
                                />
                                <Label htmlFor={props.name}>{props.name}</Label>
                            </PropertyContainer>
                            {(props.textField && field.value) &&
                                <Controller
                                    control={props.control}
                                    name={props.textFieldName}
                                    defaultValue={props.textFieldDefaultValue}
                                    render={({ field }) => (
                                        <Input
                                            {...field as any}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                props.textFieldOnChange(e.target.value);
                                            }}
                                        />
                                    )}
                                />
                            }
                        </>


                    )}
                />
            }
            {type === "Button" &&
                <PropertyContainer onClick={props.onClick}>
                    {props.icon}
                    <Label htmlFor={props.label}>{props.label}</Label>
                </PropertyContainer >
            }
            <Separator />
        </>
    )
}
