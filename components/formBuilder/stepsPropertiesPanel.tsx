import { Card } from "../ui/card";
import { Form, } from "../ui/form";
import { StepsPropertiesFormProps, PropertiesTypes, Question, QuestionStringPropsKeys, StepsPropertiesFormKeys, BasePropertiesRequiredProps, Step, StepsStringPropsKeys } from "./types";
import { UseFormReturn } from "react-hook-form";
import { Property } from "./property";
import { iconNames, type IconName } from 'lucide-react/dynamic';
export function StepsPropertiesPanel({
    propertiesRef,
    stepsPropertiesForm,
    selectedStep,
    handlePropertyTextUpdate
}: {
    propertiesRef: React.RefObject<HTMLDivElement | null>,
    stepsPropertiesForm: UseFormReturn<StepsPropertiesFormProps, any, undefined>,
    selectedStep: Step | undefined,
    handlePropertyTextUpdate: (e: string, id: string, n: StepsStringPropsKeys) => void,

}) {
    return (
        <Card ref={propertiesRef} className="px-6 gap-y-3">
            <Form {...stepsPropertiesForm}>
                <Property
                    type={PropertiesTypes.Text}
                    label="Title"
                    control={stepsPropertiesForm.control}
                    fieldName={StepsPropertiesFormKeys.Title}
                    fieldOnChange={(e) => handlePropertyTextUpdate((e as string), selectedStep!.id, "title")}
                />
                <Property
                    type={PropertiesTypes.Text}
                    label={StepsPropertiesFormKeys.Description}
                    control={stepsPropertiesForm.control}
                    fieldName={StepsPropertiesFormKeys.Description}
                    fieldOnChange={(e) => handlePropertyTextUpdate((e as string), selectedStep!.id, "description")}

                />
                <Property
                    type={PropertiesTypes.Combobox}
                    label={StepsPropertiesFormKeys.Icon}
                    control={stepsPropertiesForm.control}
                    fieldName={StepsPropertiesFormKeys.Icon}
                    fieldOnChange={(e) => {
                        if (e) {
                            handlePropertyTextUpdate((e as string), selectedStep!.id, "icon");
                        }

                    }}
                    items={Object.values(iconNames).flat()}

                />


            </Form>
        </Card>
    )
}

