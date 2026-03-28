import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
    {
        id: 1,
        title: "Deal Type",
        description: "Choose type of deal",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
    },
    {
        id: 2,
        title: "Deal Details",
        description: "Provide deal details",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        id: 3,
        title: "Deal Usage",
        description: "Limitations & Offers",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
    },
    {
        id: 4,
        title: "Review & Complete",
        description: "Launch a deal!",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
        ),
    },
];

export default function Sections() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <Card className="w-full max-w-sm border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;

                    return (
                        <div key={step.id}>
                            <button
                                onClick={() => setActiveStep(index)}
                                className="w-full flex items-center gap-4 px-6 py-5 text-left transition-all duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
                                style={{ cursor: "pointer" }}
                            >
                                {/* Icon circle */}
                                <div
                                    className="flex items-center justify-center rounded-full shrink-0 transition-all duration-300"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        background: isActive
                                            ? "#1a1a1a"
                                            : isCompleted
                                                ? "#e8f5e9"
                                                : "#f3f4f6",
                                        color: isActive
                                            ? "#ffffff"
                                            : isCompleted
                                                ? "#2e7d32"
                                                : "#9ca3af",
                                    }}
                                >
                                    {isCompleted ? (
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
                                    ) : (
                                        step.icon
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex flex-col min-w-0">
                                    <span
                                        className="text-sm leading-tight transition-colors duration-200"
                                        style={{
                                            fontWeight: isActive ? 700 : 600,
                                            color: isActive ? "#1a1a1a" : "#374151",
                                        }}
                                    >
                                        {step.title}
                                    </span>
                                    <span
                                        className="text-xs mt-0.5 transition-colors duration-200"
                                        style={{
                                            color: isActive ? "#6b7280" : "#9ca3af",
                                            fontWeight: 400,
                                        }}
                                    >
                                        {step.description}
                                    </span>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div
                                        className="ml-auto shrink-0 rounded-full"
                                        style={{
                                            width: 8,
                                            height: 8,
                                            background: "#1a1a1a",
                                        }}
                                    />
                                )}
                            </button>

                            {/* Divider */}
                            {index < steps.length - 1 && (
                                <div
                                    className="mx-6"
                                    style={{ height: 1, background: "#f0f0f0" }}
                                />
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
