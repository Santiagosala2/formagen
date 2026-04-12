
import { ReactNode } from "react";
import { FieldValues, Controller } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { BasePropertiesRequiredProps, PropertiesTypes } from "./types";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from "../ui/combobox";


function PropertyContainer({ onClick, children }: { onClick: () => void, children: ReactNode }) {
    return (
        <div onClick={onClick} className="flex items-center gap-x-3 cursor-pointer"  >
            {children}
        </div >
    )
}


export function Property<T extends FieldValues>({ ...props }: BasePropertiesRequiredProps<T>) {
    const { type } = props
    const anchor = useComboboxAnchor()

    return (
        <>
            {type === PropertiesTypes.Switch &&
                <Controller
                    control={props.control}
                    name={props.name}
                    render={({ field }) => (
                        <>
                            <PropertyContainer onClick={() => {
                                field.onChange(!field.value)
                                props.switchCheckedOnChange(!field.value);

                            }}>
                                <Switch
                                    name={field.name}
                                    checked={field.value as boolean}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        props.switchCheckedOnChange(checked)
                                    }}
                                />
                                <Label htmlFor={props.name}>{props.displayName ?? props.name}</Label>
                            </PropertyContainer>
                            {(props.textField && field.value) &&
                                <Controller
                                    control={props.control}
                                    name={props.textFieldName}
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
                            {field.value && props.children}
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
            {(type === PropertiesTypes.Text || type === PropertiesTypes.Number) &&
                <>
                    <FormField
                        control={props.control}
                        name={props.fieldName}
                        rules={props.validationRules}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{props.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field as any}
                                        type={type.toLowerCase()}
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
            {(type === PropertiesTypes.Combobox) &&
                <FormField
                    control={props.control}
                    name={props.fieldName}
                    render={({ field }) => (
                        <FormItem>
                            <Label htmlFor={props.label}>{props.label}</Label>
                            <FormControl>
                                <Combobox
                                    autoHighlight
                                    items={props.items}
                                    {...field}
                                    onValueChange={(value: any) => {
                                        field.onChange(value)
                                        props.fieldOnChange(value)
                                    }}
                                >
                                    <ComboboxInput placeholder={"Search"} showClear />
                                    <ComboboxContent anchor={anchor}>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem key={item} value={item}>
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </FormControl>
                        </FormItem>
                    )} />
            }
            <Separator />
        </>
    )
}