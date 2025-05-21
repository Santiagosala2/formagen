"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"


import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Draggable } from "@hello-pangea/dnd"
import { CheckboxQuestion, FieldsProps } from "../formBuilder/types"
import LabelEditor from "../editors/labelEditor"
import { FormModifiedItem } from "../ui/formItem"

export function CheckboxField({ form, name, label, placeholder, description, required, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef }:
    CheckboxQuestion & FieldsProps) {

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
                                className="flex flex-row items-center"
                                isDragging={snapshot.isDragging}
                                previewOn={previewOn}
                                selected={selected}
                                onClick={onSelectQuestion}
                            >
                                <FormControl>
                                    <Checkbox
                                        disabled={!previewOn}
                                        checked={field.value === undefined ? false : field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="leading-none">
                                    <FormLabel>
                                        <LabelEditor
                                            defaultLabel={label}
                                            editable={previewOn}
                                            onUpdateLabelContent={onUpdateLabelContent}
                                            id={id}
                                            popoverRef={popoverRef}
                                            required={required}
                                        />
                                    </FormLabel>
                                    <FormDescription>
                                        {description}
                                    </FormDescription>
                                    <FormMessage />
                                </div>
                            </FormModifiedItem>
                        )}
                    />
                </div>
            )}
        </Draggable>
    )
}