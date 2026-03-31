import { Card, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface StepsControlsPanelProps {
    stepsEnabled: boolean;
    onEnableSteps: () => void;
    onDisableSteps: () => void;
}

export function StepsControlsPanel({ stepsEnabled, onEnableSteps, onDisableSteps }: StepsControlsPanelProps) {
    return (
        <Card>
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Enable steps</Label>
                        <p className="text-xs text-muted-foreground">Split your form into multiple steps</p>
                    </div>
                    <Switch
                        checked={stepsEnabled}
                        onCheckedChange={(checked) => {
                            if (checked) onEnableSteps();
                            else onDisableSteps();
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
