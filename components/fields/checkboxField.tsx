"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { CheckboxQuestion, ChoiceItem, Droppables, FieldsProps } from "../formBuilder/types"
import LabelEditor from "../editors/labelEditor"
import { FormModifiedItem } from "../ui/formItem"
import OptionEditor from "../editors/optionEditor"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { v4 as uuid } from 'uuid';


export function CheckboxField({ form, label, description, required, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef, multi, items, onOptionUpdate, onOptionsUpdate, view }:
    CheckboxQuestion & FieldsProps) {
    const [parentDisabled, setParentDisabled] = useState(false)

    const onDragEnd = (result: DropResult<string>) => {
        const { destination, source, draggableId } = result
        setParentDisabled(false);
        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
        const itemsCopy = [...items ?? []]
        const getOption = itemsCopy.filter(n => n.id === draggableId)[0]
        itemsCopy.splice(source.index, 1);
        itemsCopy.splice(destination.index, 0, getOption)
        onOptionsUpdate!(id, itemsCopy)


    }

    const deleteChoiceItem = (removeId: string) => {
        const itemsCopy = [...items ?? []].filter((el) => el.id !== removeId)
        onOptionsUpdate!(id, itemsCopy)
    }

    const addChoiceItem = () => {
        onOptionsUpdate!(id, [...items ?? [], { id: uuid(), item: "Choice" + (items ?? []).length }])
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
                        defaultValue={defaultValue}
                        render={({ field }) => (

                            <FormModifiedItem
                                className={`${!multi && 'flex flex-row items-center'}`}
                                isDragging={snapshot.isDragging}
                                previewOn={previewOn}
                                selected={selected}
                                onClick={onSelectQuestion}
                            >
                                {multi &&
                                    <div>

                                        <LabelEditor
                                            defaultLabel={label}
                                            editable={previewOn}
                                            onUpdateLabelContent={onUpdateLabelContent}
                                            id={id}
                                            popoverRef={popoverRef}
                                            required={required}
                                        />
                                        <FormDescription>
                                            {description}
                                        </FormDescription>
                                        <DragDropContext
                                            onDragEnd={(result) => { onDragEnd(result); setParentDisabled(false) }}
                                            onDragStart={() => setParentDisabled(true)}
                                        >
                                            <Droppable
                                                droppableId={Droppables.CheckboxOption}
                                            >
                                                {(checkboxDropProvided) => (
                                                    <div
                                                        {...checkboxDropProvided.droppableProps}
                                                        ref={checkboxDropProvided.innerRef}
                                                        className="flex flex-col gap-2 mt-2"
                                                    >
                                                        {(items ?? []).map(
                                                            (item: ChoiceItem, ind: number) => (
                                                                <Draggable
                                                                    key={item.id}
                                                                    draggableId={item.id}
                                                                    index={ind}
                                                                    isDragDisabled={previewOn}
                                                                >
                                                                    {(checkboxDragProvided) => (

                                                                        <div
                                                                            ref={checkboxDragProvided.innerRef}
                                                                            {...checkboxDragProvided.draggableProps}
                                                                            {...checkboxDragProvided.dragHandleProps}
                                                                            className={`${!previewOn && ' hover:rounded-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50'}`}
                                                                        >
                                                                            <div
                                                                                className="flex justify-between"
                                                                                key={item.id}
                                                                            >
                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={id}
                                                                                    render={({ field }) => {
                                                                                        return (
                                                                                            <div className="flex items-center gap-3">
                                                                                                <FormItem
                                                                                                    className=""
                                                                                                >
                                                                                                    <FormControl>
                                                                                                        <Checkbox
                                                                                                            checked={field.value?.includes(ind)}
                                                                                                            disabled={view || !previewOn}
                                                                                                            onCheckedChange={(checked) => {
                                                                                                                return checked
                                                                                                                    ? field.onChange([...field.value ?? [], ind])
                                                                                                                    : field.onChange(
                                                                                                                        field.value?.filter(
                                                                                                                            (value: any) => value !== ind
                                                                                                                        )
                                                                                                                    )
                                                                                                            }}
                                                                                                        />
                                                                                                    </FormControl>

                                                                                                </FormItem>
                                                                                                <OptionEditor
                                                                                                    defaultLabel={item.item}
                                                                                                    editable={previewOn}
                                                                                                    onUpdateLabelContent={onOptionUpdate!}
                                                                                                    optionId={item.id}
                                                                                                    popoverRef={popoverRef!}
                                                                                                    required={required}

                                                                                                />
                                                                                            </div>
                                                                                        )
                                                                                    }}
                                                                                />
                                                                                {!previewOn && <Button type="button" variant={"ghost"} onClick={() => deleteChoiceItem(item.id)} ><Trash2 /></Button>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            )
                                                        )}
                                                        {checkboxDropProvided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                        <FormMessage />
                                        {!previewOn && <Button type="button" className="mt-2 max-w-1/4" variant="ghost" onClick={addChoiceItem} >
                                            <Plus />
                                            Add option
                                        </Button>}
                                    </div>}
                                {!multi &&
                                    <div className="flex gap-3">
                                        <FormControl>
                                            <Checkbox
                                                disabled={view || !previewOn}
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
                                    </div>
                                }
                            </FormModifiedItem>
                        )}
                    />
                </div>
            )}
        </Draggable>
    )
}