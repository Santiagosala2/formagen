"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Draggable } from "@hello-pangea/dnd";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from "react";

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
    const labelEditor = useEditor({
        extensions: [StarterKit],
        content: `<p>${label}</p>`,
        immediatelyRender: false,
        editable: !previewOn
    })

    useEffect(() => {
        if (!labelEditor) {
            return undefined
        }
        labelEditor.setEditable(!previewOn)
    }, [labelEditor, previewOn])

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
                                className={`bg-white ${!previewOn && 'rounded-sm border-2 border-sky-100 hover:border-sky-600 p-4'} ${snapshot.isDragging && 'border-sky-600'}`}
                            >
                                <FormLabel>
                                    <EditorContent editor={labelEditor} spellCheck={!previewOn} />
                                </FormLabel>
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