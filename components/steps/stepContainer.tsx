import { cn } from "@/lib/utils"

type StepProps = {
    previewOn: boolean,
    isActive: boolean,
    isDragging: boolean,
    state: "Completed" | "Incompleted",
    title: string,
    description: string,
    onStep: () => void,
    icon?: SVGElement,

}


export const StepContainer = ({
    previewOn,
    isActive,
    isDragging,
    title,
    description,
    onStep,
}: StepProps) => {

    return (


        <div className={cn(
            "w-full h-full flex items-center justify-center rounded-sm transition-all",
            !previewOn && "border border-sky-300 hover:border-2 hover:border-sky-600",
            !previewOn && isActive && "border-2 border-sky-600",
            isDragging && "border-sky-600 bg-card"
        )}>
            <div className="flex items-stretch flex-1 min-w-0">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={onStep}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStep(); } }}
                    className="flex-1 flex flex-col items-center gap-3 px-4 py-6 text-center transition-all duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 relative cursor-pointer"
                >

                    <div
                        className="flex items-center justify-center rounded-full shrink-0 transition-all duration-300"
                        style={{
                            width: 44,
                            height: 44,
                            background: isActive
                                ? "#1a1a1a"
                                : "#e8f5e9",
                            color: isActive
                                ? "#ffffff"
                                : "#9ca3af",
                        }}
                    >

                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>

                    </div>

                    {/* Text */}
                    <div className="flex flex-col min-w-0">
                        <span
                            className="text-sm leading-tight transition-colors duration-200"
                            style={{
                                fontWeight: 700,
                                color: "#1a1a1a"
                            }}
                        >
                            {title}
                        </span>
                        <span
                            className="text-xs mt-0.5 transition-colors duration-200"
                            style={{
                                color: "#6b7280",
                                fontWeight: 400,
                            }}
                        >
                            {description}
                        </span>
                    </div>

                    <div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                            width: 8,
                            height: 8,
                            background: "#1a1a1a",
                        }}
                    />

                </div>


            </div>

        </div>
    )
}