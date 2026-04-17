import { Card } from "../ui/card";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { PropertiesTypes, StepFormProps } from "./types";
import { Property } from "./property";

interface StepsControlsPanelProps {
    stepsEnabled: boolean;
    validateOnStep: boolean;
    onEnableSteps: () => void;
    onDisableSteps: () => void;
    onValidateOnStep: () => void;
    onDisableValidateOnStep: () => void;
}

export function StepsControlsPanel({ stepsEnabled, validateOnStep, onEnableSteps, onDisableSteps, onValidateOnStep, onDisableValidateOnStep }: StepsControlsPanelProps) {
    const form = useForm<StepFormProps>(
        {
            mode: "onChange",
            defaultValues: {
                EnabledStep: stepsEnabled,
                ValidateOnStep: validateOnStep
            }
        })
    return (
        <Card className="px-6 gap-y-3">
            <Form {...form}>
                <Property
                    type={PropertiesTypes.Switch}
                    name={"EnabledStep"}
                    displayName={"Enable steps"}
                    control={form.control}
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
                    control={form.control}
                    switchCheckedOnChange={(checked: boolean) => {
                        if (checked) onValidateOnStep();
                        else onDisableValidateOnStep();
                    }}
                    textField={false}
                />

            </Form>
        </Card>
    );
}


