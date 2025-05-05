import { Control, Controller } from "react-hook-form"
import { PropertiesProps, PropertiesRequiredProps, PropertiesTypes } from "./types"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import { ReactNode } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

function PropertyContainer({ onClick, children }: { onClick: () => void, children: ReactNode }) {

    return (
        <div onClick={onClick} className="flex items-center gap-x-3 cursor-pointer"  >
            {children}
        </div >

    )
}

export function Property({ ...props }: PropertiesRequiredProps) {
    const { type } = props


    return (
        <>
            {type === PropertiesTypes.Switch &&
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
                                    rules={props.textValidationRules}
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
            {type === PropertiesTypes.Button &&
                <PropertyContainer onClick={props.onClick}>
                    {props.icon}
                    <Label htmlFor={props.label}>{props.label}</Label>
                </PropertyContainer >
            }
            {type === PropertiesTypes.Text &&
                <>
                    {/* <Label htmlFor={props.name}>{props.name}</Label>
                    <Controller
                        control={props.control}
                        name={props.fieldName}
                        defaultValue={props.fieldDefaultValue}
                        rules={props.validationRules}
                        render={({ field }) => (
                            <Input
                                {...field as any}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    props.fieldOnChange(e.target.value);
                                }}
                            />
                        )}
                    /> */}

                    <FormField
                        control={props.control}
                        name={props.fieldName}
                        defaultValue={props.fieldDefaultValue}
                        rules={props.validationRules}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{props.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field as any}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            props.fieldOnChange(e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        )}
                    />

                </>
            }

            <Separator />
        </>
    )
}
