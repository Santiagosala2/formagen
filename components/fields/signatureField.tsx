"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Draggable } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { memo, useEffect, useRef, useState } from "react";
import { FieldsProps, SignatureQuestion, TextQuestion } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";
import SignatureCanvas from 'react-signature-canvas'
import { Button } from "../ui/button";
import { DeleteIcon } from "lucide-react";


const SignatureField = ({ form, label, description, required, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef, view }:
    SignatureQuestion & FieldsProps) => {

    const sigCanvas = useRef<SignatureCanvas>(null);

    useEffect(() => {
        if (defaultValue) {
            sigCanvas.current?.fromDataURL(defaultValue)
        }
    }, [])

    useEffect(() => {
        if (sigCanvas) {
            if (view) {
                sigCanvas.current?.off()
                return
            }
            if (!previewOn && !view) {
                sigCanvas.current?.clear()
                sigCanvas.current?.off()
                return
            }
            if (previewOn) {
                sigCanvas.current?.on();
                return;
            }
        }

    }, [previewOn, view])

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
                                    <div className="flex justify-start items-center gap-6 aria-invalid:ring-destructive/20 aria-invalid:border-destructive">
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            penColor='black'
                                            canvasProps={{ height: 75, className: `border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-4 w-5/6 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm` }}
                                            onEnd={() => {
                                                if (sigCanvas.current) {
                                                    field.onChange(sigCanvas.current.toDataURL());
                                                }
                                            }}
                                        />
                                        {(previewOn && !view) &&

                                            <Button
                                                variant="outline"
                                                className=""
                                                onClick={
                                                    () => {
                                                        sigCanvas.current?.clear()
                                                        field.onChange("")
                                                    }
                                                }
                                            >
                                                <DeleteIcon />
                                            </Button>}
                                    </div>
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

export default memo(SignatureField); 