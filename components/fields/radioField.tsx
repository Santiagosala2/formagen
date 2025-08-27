"use client";

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "../ui/form";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { ChoiceItem, Droppables, FieldsProps, RadioQuestion } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import OptionEditor from "../editors/optionEditor";
import { useState } from "react";
import { v4 as uuid } from 'uuid';


const RadioField = ({
    form,
    label,
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
    onOptionsUpdate,
    view
}:
    RadioQuestion & FieldsProps) => {

    const [parentDisabled, setParentDisabled] = useState(false)

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
        const getOption = itemsCopy.filter(n => n.id === draggableId)[0]
        itemsCopy.splice(source.index, 1);
        itemsCopy.splice(destination.index, 0, getOption)
        onOptionsUpdate!(id, itemsCopy)
    }

    const deleteChoiceItem = (removeId: string) => {
        const itemsCopy = [...items].filter((el) => el.id !== removeId)
        onOptionsUpdate!(id, itemsCopy)
    }

    const addChoiceItem = () => {
        onOptionsUpdate!(id, [...items, { id: uuid(), item: "Choice" + items.length }])
    }

    return (
        <Draggable draggableId={id} index={index} isDragDisabled={previewOn || parentDisabled} >
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
                                        onDragEnd={(result) => { onDragEnd(result); setParentDisabled(false) }}
                                        onDragStart={() => setParentDisabled(true)}
                                    >
                                        <Droppable
                                            droppableId={Droppables.RadioOption}

                                        >
                                            {(radioDropProvided) => (
                                                <div
                                                    {...radioDropProvided.droppableProps}
                                                    ref={radioDropProvided.innerRef}
                                                >
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        className="flex flex-col gap-2"
                                                        disabled={view || !previewOn}
                                                        value={field.value}

                                                    >
                                                        {items.map(
                                                            (item: ChoiceItem, ind: number) => (

                                                                <Draggable
                                                                    key={item.id}
                                                                    draggableId={item.id}
                                                                    index={ind}
                                                                    isDragDisabled={previewOn}
                                                                >
                                                                    {(radioDragProvided) => (
                                                                        <div
                                                                            ref={radioDragProvided.innerRef}
                                                                            {...radioDragProvided.draggableProps}
                                                                            {...radioDragProvided.dragHandleProps}
                                                                            className={`${!previewOn && ' hover:rounded-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50'}`}
                                                                        >
                                                                            <div
                                                                                className="flex justify-between"
                                                                                key={item.id}
                                                                            >
                                                                                <FormItem className="flex items-center gap-3">

                                                                                    <FormControl>
                                                                                        <RadioGroupItem disabled={view || !previewOn} value={item.item} />
                                                                                    </FormControl>
                                                                                    <OptionEditor
                                                                                        defaultLabel={item.item}
                                                                                        editable={previewOn}
                                                                                        onUpdateLabelContent={onOptionUpdate!}
                                                                                        optionId={item.id}
                                                                                        popoverRef={popoverRef!}
                                                                                        required={required}
                                                                                    />
                                                                                </FormItem>
                                                                                {!previewOn && <Button type="button" variant={"ghost"} onClick={() => deleteChoiceItem(item.id)} ><Trash2 /></Button>}
                                                                            </div>
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
                                {!previewOn && <Button type="button" className="max-w-1/4" variant="ghost" onClick={addChoiceItem} >
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