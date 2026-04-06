import { Card, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { Property } from "./propertiesPanel";
import { PropertiesTypes, StepFormProps, StepsRequiredProps } from "./types";

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
                <PropertyStepPanel
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

const PropertyStepPanel = ({ ...props }: StepsRequiredProps) => {
    return (
        <Property {...props} />
    )
}
