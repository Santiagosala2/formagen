import { ReactNode } from "react";
import { FormItem } from "./form";
import { cn } from "@/lib/utils";

export function FormModifiedItem({ previewOn, isDragging, selected, onClick, children, className }: {
    className?: string,
    previewOn: boolean,
    isDragging: boolean,
    selected: boolean
    children: ReactNode,
    onClick: () => void
}) {
    return (
        <FormItem
            onClick={onClick}
            className={cn(`
            ${!previewOn && `rounded-sm border-1 hover:border-2 border-sky-300 hover:border-sky-600 p-4
                             ${selected ? 'border-2 border-sky-600' : 'border-1 border-sky-300'}
            `} 
            ${isDragging && 'border-sky-600 bg-card'}`, className)

            }
        >
            {children}
        </FormItem>
    )
}