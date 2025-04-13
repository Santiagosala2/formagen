"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Draggable } from "@hello-pangea/dnd";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import { Bold, Italic, Underline } from "lucide-react";
import LabelEditor from "../labelEditor";

export default function TextField({ form, name, label, placeholder, description, index, previewOn, id, defaultValue }: {
    form: any
    name: string
    label: string
    placeholder: string
    description: string
    index: number
    previewOn: boolean
    id: string
    defaultValue: string | undefined
}) {
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
                        defaultValue={defaultValue || ''}
                        render={({ field }) => (
                            <FormItem
                                className={`${!previewOn && 'rounded-sm border-1 hover:border-2 border-sky-300 hover:border-sky-600 p-4'} ${snapshot.isDragging && 'border-sky-600 bg-card'}`}
                            >
                                <LabelEditor currentLabel={label} editable={previewOn} />
                                <FormControl>
                                    <Input disabled={!previewOn} placeholder={placeholder} {...field} />
                                </FormControl>
                                <FormDescription>
                                    {description}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

        </Draggable>
    )
}