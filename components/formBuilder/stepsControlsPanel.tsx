import { Card } from "../ui/card";
import { PropertiesTypes, StepFormProps } from "./types";
import { Property } from "./property";
import { UseFormReturn } from "react-hook-form";
import { Form } from "../ui/form";

interface StepsControlsPanelProps {
    stepsForm: UseFormReturn<StepFormProps, any, undefined>,
    onEnableSteps: () => void;
    onDisableSteps: () => void;
    onValidateOnStep: () => void;
    onDisableValidateOnStep: () => void;
    onValidateOnJump: () => void;
    onDisableValidateOnJump: () => void;
}

export function StepsControlsPanel({ stepsForm, onEnableSteps, onDisableSteps, onValidateOnStep, onDisableValidateOnStep, onValidateOnJump, onDisableValidateOnJump }: StepsControlsPanelProps) {

    return (
        <Card className="px-6 gap-y-3">
            <Form {...stepsForm}>
                <Property
                    type={PropertiesTypes.Switch}
                    name={"EnabledStep"}
                    displayName={"Enable steps"}
                    control={stepsForm.control}
                    switchCheckedOnChange={(checked: boolean) => {
                        if (checked) onEnableSteps();
                        else onDisableSteps();
                    }}
                    textField={false}
                />
                <Property
                    type={PropertiesTypes.Switch}
                    name={"ValidateOnStep"}
                    displayName={"Validate on next step"}
                    control={stepsForm.control}
                    switchCheckedOnChange={(checked: boolean) => {
                        if (checked) onValidateOnStep();
                        else onDisableValidateOnStep();
                    }}
                    textField={false}
                />
                <Property
                    type={PropertiesTypes.Switch}
                    name={"ValidateOnJump"}
                    displayName={"Validate on jump"}
                    control={stepsForm.control}
                    switchCheckedOnChange={(checked: boolean) => {
                        if (checked) onValidateOnJump();
                        else onDisableValidateOnJump();
                    }}
                    textField={false}
                />

            </Form>
        </Card>
    );
}


