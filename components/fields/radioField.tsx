"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { Droppables, FieldsProps, RadioQuestion } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import OptionEditor from "../editors/optionEditor";


const RadioField = ({
    form,
    name,
    label,
    placeholder,
    description,
    required,
    selected,
    index,
    previewOn,
    id,
    defaultValue,
    onUpdateLabelContent,
    onSelectQuestion,
    popoverRef,
    items,
    onOptionUpdate,
    onOptionsUpdate }:
    RadioQuestion & FieldsProps) => {

    const onDragEnd = (result: DropResult<string>) => {
        const { destination, source, draggableId } = result

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
        const itemsCopy = [...items]
        const getOption = itemsCopy.filter(n => n === draggableId)[0]
        itemsCopy.splice(source.index, 1);
        itemsCopy.splice(destination.index, 0, getOption)
        onOptionsUpdate!(id, itemsCopy)
    }


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
                                    <DragDropContext
                                        onDragEnd={onDragEnd}
                                    >
                                        <Droppable
                                            droppableId={Droppables.RadioOption}

                                        >
                                            {(radioDropProvided, radioDropSnapshot) => (
                                                <div
                                                    {...radioDropProvided.droppableProps}
                                                    ref={radioDropProvided.innerRef}
                                                >
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        className="flex flex-col"
                                                        disabled={!previewOn}
                                                        value={field.value}

                                                    >
                                                        {items.map(
                                                            (item: any, ind: number) => (
                                                                <Draggable
                                                                    key={item}
                                                                    draggableId={item}
                                                                    index={ind}
                                                                    isDragDisabled={previewOn}
                                                                >
                                                                    {(radioDragProvided, radioDragSnapshot) => (

                                                                        <div
                                                                            ref={radioDragProvided.innerRef}
                                                                            {...radioDragProvided.draggableProps}
                                                                            {...radioDragProvided.dragHandleProps}

                                                                        >

                                                                            <FormItem className="flex items-center gap-3">

                                                                                <FormControl>
                                                                                    <RadioGroupItem disabled={!previewOn} value={item} />
                                                                                </FormControl>
                                                                                <OptionEditor
                                                                                    defaultLabel={item}
                                                                                    editable={previewOn}
                                                                                    onUpdateLabelContent={onOptionUpdate!}
                                                                                    optionId={ind}
                                                                                    popoverRef={popoverRef!}
                                                                                    required={required}
                                                                                />
                                                                            </FormItem>

                                                                        </div>

                                                                    )}
                                                                </Draggable>
                                                            )
                                                        )}
                                                        {radioDropProvided.placeholder}
                                                    </RadioGroup>
                                                </div>

                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </FormControl>
                                <FormDescription>
                                    {description}
                                </FormDescription>
                                <FormMessage />
                                {!previewOn && <Button type="button" className="max-w-1/4" variant="ghost" onClick={() => { onOptionsUpdate!(id, [...items, "Choice" + items.length]) }} >
                                    <Plus />
                                    Add option
                                </Button>}
                            </FormModifiedItem>

                        )}
                    />

                </div>
            )}

        </Draggable>
    )
}

export default RadioField; 