"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Draggable } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { memo, RefObject, useCallback, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { FieldsProps, TextQuestion } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";


const TextField = ({ form, name, label, placeholder, description, required, long, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef, view }:
    TextQuestion & FieldsProps) => {
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
                                    popoverRef={popoverRef!}
                                    required={required}
                                />
                                <FormControl>
                                    {!long ?
                                        (<Input disabled={view || !previewOn} placeholder={placeholder} {...field} />)
                                        :
                                        (<Textarea disabled={view || !previewOn} placeholder={placeholder} {...field} />)
                                    }
                                </FormControl>
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

export default memo(TextField); 