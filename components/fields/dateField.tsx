"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Draggable } from "@hello-pangea/dnd"
import { DateQuestion, FieldsProps } from "../formBuilder/types"
import { RefObject, useEffect, useState } from "react"
import LabelEditor from "../editors/labelEditor"
import { FormModifiedItem } from "../ui/formItem"


export function DateField({ form, name, label, placeholder, description, required, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef, dateRestriction, dateRestrictionRule, view }:
    DateQuestion & FieldsProps) {
    return (
        <Draggable draggableId={id} index={index} isDragDisabled={previewOn} >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <FormField
                        control={form.control}
                        name={id}
                        defaultValue={defaultValue}
                        render={({ field }) => (

                            <FormModifiedItem
                                isDragging={snapshot.isDragging}
                                previewOn={previewOn}
                                selected={selected}
                                onClick={onSelectQuestion}
                            >
                                <LabelEditor
                                    defaultLabel={label}
                                    editable={previewOn}
                                    onUpdateLabelContent={onUpdateLabelContent}
                                    id={id}
                                    popoverRef={popoverRef}
                                    required={required}
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                disabled={view || !previewOn}
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "dd/MM/yyyy")

                                                ) : (
                                                    <span>{placeholder}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                                if (dateRestriction && dateRestrictionRule === "past") {
                                                    return date > new Date()
                                                }
                                                if (dateRestriction && dateRestrictionRule === "future") {
                                                    return date < new Date()
                                                }
                                                return dateRestriction ?? false
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    {description}
                                </FormDescription>
                                <FormMessage />
                            </FormModifiedItem>
                        )}
                    />
                </div>
            )}
        </Draggable>
    )
}
