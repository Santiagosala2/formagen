import { cn } from "@/lib/utils"
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { StepState, StepStates } from "../formBuilder/types";
type StepProps = {
    previewOn: boolean,
    isSelected: boolean,
    isDragging: boolean,
    state?: StepState,
    title: string,
    description: string,
    onStep: () => void,
    icon: IconName,

}


export const StepContainer = ({
    previewOn,
    isSelected,
    isDragging,
    title,
    description,
    onStep,
    icon,
    state
}: StepProps) => {

    const isActive = isSelected && previewOn;
    const isCompleted = state === StepStates.Completed && previewOn;
    const isUncompleted = state === StepStates.Umcompleted && previewOn;

    console.log(state, "state")

    const calculateIconBackground = () => {
        if (isActive) {
            return "#1a1a1a"
        }
        if (isCompleted) {
            return "#e8f5e9"
        }
        if (isUncompleted) {
            return "#FFEBEE"
        }
        return "#f3f4f6";
    }

    const calculateIconColor = () => {
        if (isActive) {
            return "#ffffff"
        }
        if (isCompleted) {
            return "#2e7d32"
        }
        if (isUncompleted) {
            return "#ff9fad"
        }
        return "#9ca3af";
    }

    return (


        <div className={cn(
            "w-full h-full flex items-center justify-center rounded-sm transition-all",
            !previewOn && "border border-sky-300 hover:border-2 hover:border-sky-600",
            !previewOn && isSelected && "border-2 border-sky-600",
            isDragging && "border-sky-600 bg-card"
        )}>
            <div className="flex items-stretch flex-1 min-w-0">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={onStep}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStep(); } }}
                    className="flex-1 flex flex-col items-center gap-3 px-4 py-6 text-center transition-all duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 relative cursor-pointer min-w-0"
                >

                    <div
                        className="flex items-center justify-center rounded-full shrink-0 transition-all duration-300"
                        style={{
                            width: 44,
                            height: 44,
                            background: calculateIconBackground(),
                            color: calculateIconColor()
                        }}
                    >
                        <DynamicIcon name={icon} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col w-full min-w-0">
                        <span
                            className="text-sm leading-tight transition-colors duration-200 block truncate  min-w-0"
                            style={{
                                fontWeight: 700,
                                color: "#1a1a1a"
                            }}
                        >
                            {title}
                        </span>
                        <span
                            className="text-xs mt-0.5 transition-colors duration-200 block truncate  min-w-0"
                            style={{
                                color: "#6b7280",
                                fontWeight: 400,
                            }}
                        >
                            {description}
                        </span>
                    </div>

                    {isActive &&
                        <div
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                            style={{
                                width: 8,
                                height: 8,
                                background: "#1a1a1a",
                            }}
                        />}

                </div>


            </div>

        </div>
    )
}