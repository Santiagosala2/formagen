import { Card } from "../ui/card";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { PropertiesTypes, StepFormProps } from "./types";
import { Property } from "./property";

interface StepsControlsPanelProps {
    stepsEnabled: boolean;
    onEnableSteps: () => void;
    onDisableSteps: () => void;
}

export function StepsControlsPanel({ stepsEnabled, onEnableSteps, onDisableSteps }: StepsControlsPanelProps) {
    const form = useForm<StepFormProps>(
        {
            mode: "onChange",
            defaultValues: {
                EnabledStep: stepsEnabled
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

            </Form>
        </Card>
    );
}


