import { Trash } from "lucide-react";
import { Card } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { DateRestrictionRule, DraggableFields, PropertiesProps, PropertiesRequiredProps, PropertiesTypes, Question, QuestionStringPropsKeys, PropertiesKeys } from "./types";
import { Controller, UseFormReturn } from "react-hook-form";
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
    handleDeleteQuestion

}: {
    propertiesRef: React.RefObject<HTMLDivElement | null>,
    propertiesForm: UseFormReturn<PropertiesProps, any, undefined>,
    selectedQuestion: Question | undefined,
    handlePropertyTextUpdate: (e: string, id: string, n: QuestionStringPropsKeys) => void,
    handleRequiredChanges: (checked: boolean) => void,
    handleTextChanges: (checked: boolean) => void,
    handleDateRulesChanges: (checked: boolean, rule: DateRestrictionRule) => void,
    handleMultiChanges: (checked: boolean) => void,
    handleDeleteQuestion: (id: string) => void
}) {
    return (
        <Card ref={propertiesRef} className="px-6 gap-y-3">
            <Form {...propertiesForm}>
                <Property
                    type={PropertiesTypes.Text}
                    label="Name"
                    control={propertiesForm.control}
                    fieldName={PropertiesKeys.NameContent}
                    fieldDefaultValue={selectedQuestion?.name}
                    fieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "name")}
                    validationRules={{
                        validate: (value) => {
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
                    name={PropertiesKeys.Required}
                    control={propertiesForm.control}
                    defaultValue={!!selectedQuestion?.required}
                    switchCheckedOnChange={(checked) => handleRequiredChanges(checked)}
                    textField={false}
                />
                {selectedQuestion?.type !== DraggableFields.Checkbox && <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesKeys.Placeholder}
                    control={propertiesForm.control}
                    defaultValue={!!selectedQuestion?.placeholder}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "placeholder");
                            propertiesForm.setValue(PropertiesKeys.PlaceholderContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={PropertiesKeys.PlaceholderContent}
                    textFieldDefaultValue={selectedQuestion?.placeholder}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "placeholder")}
                />}
                <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesKeys.Description}
                    control={propertiesForm.control}
                    defaultValue={!!selectedQuestion?.description}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "description");
                            propertiesForm.setValue(PropertiesKeys.DescriptionContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={PropertiesKeys.DescriptionContent}
                    textFieldDefaultValue={selectedQuestion?.description}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "description")}
                />
                {selectedQuestion?.type === DraggableFields.Text && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={PropertiesKeys.Long}
                        control={propertiesForm.control}
                        defaultValue={!!selectedQuestion?.long}
                        switchCheckedOnChange={(checked) => handleTextChanges(checked)}
                        textField={false}
                    />
                )
                }
                {selectedQuestion?.type === DraggableFields.Date && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={PropertiesKeys.DateRestriction}
                        displayName="Date restriction"
                        control={propertiesForm.control}
                        defaultValue={selectedQuestion?.dateRestriction ?? false}
                        switchCheckedOnChange={(checked) => handleDateRulesChanges(checked, selectedQuestion.dateRestrictionRule ?? "past")}
                        textField={false}
                        children={
                            <ToggleGroup type="single" value={selectedQuestion.dateRestrictionRule ?? "past"} onValueChange={(val: any) => handleDateRulesChanges(true, val)} >
                                <ToggleGroupItem value="past" aria-label="Toggle past date rule">
                                    Past
                                </ToggleGroupItem>
                                <ToggleGroupItem value="future" aria-label="Toggle future date rule">
                                    Future
                                </ToggleGroupItem>
                            </ToggleGroup>
                        }
                    />
                )
                }
                {selectedQuestion?.type === DraggableFields.Checkbox && <Property
                    type={PropertiesTypes.Switch}
                    name={PropertiesKeys.Multiple}
                    control={propertiesForm.control}
                    defaultValue={selectedQuestion?.multi ?? false}
                    switchCheckedOnChange={(checked) => handleMultiChanges(checked)}
                    textField={false}
                />}

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
            {type === PropertiesTypes.Text &&
                <>
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