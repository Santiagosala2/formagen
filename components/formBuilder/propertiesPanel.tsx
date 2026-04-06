import { Trash } from "lucide-react";
import { Card } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ComboboxQuestion, DateRestrictionRule, DraggableFields, NumberQuestion, PropertiesFormProps, PropertiesRequiredProps, PropertiesTypes, Question, QuestionStringPropsKeys, PropertiesFormKeys, BasePropertiesRequiredProps, BasePropertiesProps } from "./types";
import { Controller, FieldValues, UseFormReturn } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ReactNode } from "react";
import { Separator } from "../ui/separator";

export function PropertiesPanel({
    propertiesRef,
    propertiesForm,
    selectedQuestion,
    handlePropertyTextUpdate,
    handleRequiredChanges,
    handleTextChanges,
    handleDateRulesChanges,
    handleMultiChanges,
    handleNumberPropertiesChanges,
    handleDeleteQuestion

}: {
    propertiesRef: React.RefObject<HTMLDivElement | null>,
    propertiesForm: UseFormReturn<PropertiesFormProps, any, undefined>,
    selectedQuestion: Question | undefined,
    handlePropertyTextUpdate: (e: string, id: string, n: QuestionStringPropsKeys) => void,
    handleRequiredChanges: (checked: boolean) => void,
    handleTextChanges: (checked: boolean) => void,
    handleDateRulesChanges: (checked: boolean, rule: DateRestrictionRule) => void,
    handleMultiChanges: (checked: boolean) => void,
    handleNumberPropertiesChanges: (property: "min" | "max" | "step" | "allowDecimals", value: number | boolean | undefined) => void,
    handleDeleteQuestion: (id: string) => void
}) {
    return (
        <Card ref={propertiesRef} className="px-6 gap-y-3">
            <Form {...propertiesForm}>
                <Property
                    type={PropertiesTypes.Text}
                    label="Name"
                    control={propertiesForm.control}
                    fieldName={PropertiesFormKeys.NameContent}
                    fieldOnChange={(e) => handlePropertyTextUpdate((e as string), selectedQuestion!.id, "name")}
                    validationRules={{
                        validate: (value: string) => {
                            if (typeof value !== "string") {
                                return true;
                            }
                            if (value.includes(' ')) {
                                return 'Contains spaces';
                            }
                            // if (questionsAdded.some((el => selectedQuestion!.id !== el.id && el.name === value))) {
                            //     return "needs to be unique"
                            // }
                            return true;
                        }
                    }}
                />
                <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesFormKeys.Required}
                    control={propertiesForm.control}
                    switchCheckedOnChange={(checked) => handleRequiredChanges(checked)}
                    textField={false}
                />
                {(selectedQuestion?.type !== DraggableFields.Checkbox && selectedQuestion?.type !== DraggableFields.Signature) && <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesFormKeys.Placeholder}
                    control={propertiesForm.control}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "placeholder");
                            propertiesForm.setValue(PropertiesFormKeys.PlaceholderContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={PropertiesFormKeys.PlaceholderContent}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "placeholder")}
                />}
                <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesFormKeys.Description}
                    control={propertiesForm.control}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "description");
                            propertiesForm.setValue(PropertiesFormKeys.DescriptionContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={PropertiesFormKeys.DescriptionContent}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "description")}
                />
                {selectedQuestion?.type === DraggableFields.Text && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={PropertiesFormKeys.Long}
                        control={propertiesForm.control}
                        switchCheckedOnChange={(checked) => handleTextChanges(checked)}
                        textField={false}
                    />
                )
                }
                {selectedQuestion?.type === DraggableFields.Date && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={PropertiesFormKeys.DateRestriction}
                        displayName="Date restriction"
                        control={propertiesForm.control}
                        switchCheckedOnChange={(checked) => handleDateRulesChanges(checked, selectedQuestion.dateRestrictionRule ?? "past")}
                        textField={false}
                    >
                        <ToggleGroup type="single" value={selectedQuestion.dateRestrictionRule} onValueChange={(val: any) => handleDateRulesChanges(true, val)} >
                            <ToggleGroupItem value="past" aria-label="Toggle past date rule">
                                Past
                            </ToggleGroupItem>
                            <ToggleGroupItem value="future" aria-label="Toggle future date rule">
                                Future
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </Property>
                )
                }
                {selectedQuestion?.type === DraggableFields.Checkbox && <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesFormKeys.Multiple}
                    control={propertiesForm.control}
                    switchCheckedOnChange={(checked) => handleMultiChanges(checked)}
                    textField={false}
                />}
                {selectedQuestion?.type === DraggableFields.Combobox && <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesFormKeys.Multiple}
                    displayName="Multiple"
                    control={propertiesForm.control}
                    switchCheckedOnChange={(checked) => handleMultiChanges(checked)}
                    textField={false}
                />}
                {selectedQuestion?.type === DraggableFields.Number && (
                    <>
                        <Property
                            type={PropertiesTypes.Number}
                            label="Min"
                            control={propertiesForm.control}
                            fieldName={PropertiesFormKeys.Min}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("min", e as number);
                            }}
                        />
                        <Property
                            type={PropertiesTypes.Number}
                            label="Max"
                            control={propertiesForm.control}
                            fieldName={PropertiesFormKeys.Max}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("max", e as number);
                            }}
                        />
                        <Property
                            type={PropertiesTypes.Number}
                            label="Step"
                            control={propertiesForm.control}
                            fieldName={PropertiesFormKeys.Step}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("step", e as number)
                            }}

                        />
                        <Property
                            type={PropertiesTypes.Switch}
                            name={PropertiesFormKeys.AllowDecimals}
                            displayName="Allow decimals"
                            control={propertiesForm.control}
                            switchCheckedOnChange={(checked) => handleNumberPropertiesChanges("allowDecimals", checked)}
                            textField={false}
                        />
                    </>
                )}

                <Property
                    type={PropertiesTypes.Button}
                    onClick={() => handleDeleteQuestion(selectedQuestion!.id)}
                    label="Delete"
                    icon={<Trash className="text-destructive" width={30} />}
                />
            </Form>
        </Card>
    )
}

function PropertyContainer({ onClick, children }: { onClick: () => void, children: ReactNode }) {
    return (
        <div onClick={onClick} className="flex items-center gap-x-3 cursor-pointer"  >
            {children}
        </div >
    )
}


export function Property<T extends FieldValues>({ ...props }: BasePropertiesRequiredProps<T>) {
    const { type } = props

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

            <Separator />
        </>
    )
}