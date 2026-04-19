import { Trash } from "lucide-react";
import { Card } from "../ui/card";
import { Form, } from "../ui/form";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { DateRestrictionRule, DraggableFields, QuestionsPropertiesFormProps, PropertiesTypes, Question, QuestionStringPropsKeys, QuestionsPropertiesFormKeys, BasePropertiesRequiredProps } from "./types";
import { UseFormReturn } from "react-hook-form";
import { Property } from "./property";

export function QuestionsPropertiesPanel({
    propertiesRef,
    questionsPropertiesForm,
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
    questionsPropertiesForm: UseFormReturn<QuestionsPropertiesFormProps, any, undefined>,
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
            <Form {...questionsPropertiesForm}>
                <Property
                    type={PropertiesTypes.Text}
                    label="Name"
                    control={questionsPropertiesForm.control}
                    fieldName={QuestionsPropertiesFormKeys.NameContent}
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
                    name={QuestionsPropertiesFormKeys.Required}
                    control={questionsPropertiesForm.control}
                    switchCheckedOnChange={(checked) => handleRequiredChanges(checked)}
                    textField={false}
                />
                {(selectedQuestion?.type !== DraggableFields.Checkbox && selectedQuestion?.type !== DraggableFields.Signature) && <Property
                    type={PropertiesTypes.Switch}
                    name={QuestionsPropertiesFormKeys.Placeholder}
                    control={questionsPropertiesForm.control}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "placeholder");
                            questionsPropertiesForm.setValue(QuestionsPropertiesFormKeys.PlaceholderContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={QuestionsPropertiesFormKeys.PlaceholderContent}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "placeholder")}
                />}
                <Property
                    type={PropertiesTypes.Switch}
                    name={QuestionsPropertiesFormKeys.Description}
                    control={questionsPropertiesForm.control}
                    switchCheckedOnChange={(checked) => {
                        if (!checked) {
                            handlePropertyTextUpdate("", selectedQuestion!.id, "description");
                            questionsPropertiesForm.setValue(QuestionsPropertiesFormKeys.DescriptionContent, undefined)
                        }
                    }}
                    textField
                    textFieldName={QuestionsPropertiesFormKeys.DescriptionContent}
                    textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "description")}
                />
                {selectedQuestion?.type === DraggableFields.Text && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={QuestionsPropertiesFormKeys.Long}
                        control={questionsPropertiesForm.control}
                        switchCheckedOnChange={(checked) => handleTextChanges(checked)}
                        textField={false}
                    />
                )
                }
                {selectedQuestion?.type === DraggableFields.Date && (
                    <Property
                        type={PropertiesTypes.Switch}
                        name={QuestionsPropertiesFormKeys.DateRestriction}
                        displayName="Date restriction"
                        control={questionsPropertiesForm.control}
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
                    name={QuestionsPropertiesFormKeys.Multiple}
                    control={questionsPropertiesForm.control}
                    switchCheckedOnChange={(checked) => handleMultiChanges(checked)}
                    textField={false}
                />}
                {selectedQuestion?.type === DraggableFields.Combobox && <Property
                    type={PropertiesTypes.Switch}
                    name={QuestionsPropertiesFormKeys.Multiple}
                    displayName="Multiple"
                    control={questionsPropertiesForm.control}
                    switchCheckedOnChange={(checked) => handleMultiChanges(checked)}
                    textField={false}
                />}
                {selectedQuestion?.type === DraggableFields.Number && (
                    <>
                        <Property
                            type={PropertiesTypes.Number}
                            label="Min"
                            control={questionsPropertiesForm.control}
                            fieldName={QuestionsPropertiesFormKeys.Min}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("min", e as number);
                            }}
                        />
                        <Property
                            type={PropertiesTypes.Number}
                            label="Max"
                            control={questionsPropertiesForm.control}
                            fieldName={QuestionsPropertiesFormKeys.Max}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("max", e as number);
                            }}
                        />
                        <Property
                            type={PropertiesTypes.Number}
                            label="Step"
                            control={questionsPropertiesForm.control}
                            fieldName={QuestionsPropertiesFormKeys.Step}
                            fieldOnChange={(e) => {
                                handleNumberPropertiesChanges("step", e as number)
                            }}

                        />
                        <Property
                            type={PropertiesTypes.Switch}
                            name={QuestionsPropertiesFormKeys.AllowDecimals}
                            displayName="Allow decimals"
                            control={questionsPropertiesForm.control}
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

