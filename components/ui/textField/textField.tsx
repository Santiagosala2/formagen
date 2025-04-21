"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Draggable } from "@hello-pangea/dnd";
import LabelEditor from "../labelEditor";
import { memo, RefObject, useCallback, useEffect, useState } from "react";


const TextField = ({ form, name, label, placeholder, description, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, outsideFormClickRef }: {
    form: any
    name: string
    label: string
    placeholder: string
    description: string
    selected: boolean
    index: number
    previewOn: boolean
    id: string
    defaultValue: string | undefined
    onUpdateLabelContent: (content: string, id: string) => void
    onSelectQuestion: () => void
    outsideFormClickRef: RefObject<HTMLDivElement | null>
}) => {

    const [initialLabel, setInitialLabel] = useState<string>();

    useEffect(() => {
        setInitialLabel(label)
    }, [])

    if (!initialLabel) return null

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
                                onClick={onSelectQuestion}
                                className={`
                                    ${!previewOn && `rounded-sm border-1 hover:border-2 border-sky-300 hover:border-sky-600 p-4
                                                     ${selected ? 'border-2 border-sky-600' : 'border-1 border-sky-300'}
                                    `} 
                                    ${snapshot.isDragging && 'border-sky-600 bg-card'}`

                                }
                            >
                                <LabelEditor
                                    currentLabel={initialLabel}
                                    editable={previewOn}
                                    onUpdateLabelContent={onUpdateLabelContent}
                                    id={id}
                                    outsideFormClickRef={outsideFormClickRef}
                                />
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

export default memo(TextField); 