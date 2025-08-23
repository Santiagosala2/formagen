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
import { CheckboxQuestion, Droppables, FieldsProps } from "../formBuilder/types"
import LabelEditor from "../editors/labelEditor"
import { FormModifiedItem } from "../ui/formItem"
import OptionEditor from "../editors/optionEditor"
import { Plus } from "lucide-react"

export function CheckboxField({ form, label, description, required, selected, index, previewOn, id, defaultValue, onUpdateLabelContent, onSelectQuestion, popoverRef, multi, items, onOptionUpdate, onOptionsUpdate, view }:
    CheckboxQuestion & FieldsProps) {

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
        const itemsCopy = [...items ?? []]
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
                                            onDragEnd={onDragEnd}
                                        >
                                            <Droppable
                                                droppableId={Droppables.CheckboxOption}
                                            >
                                                {(checkboxDropProvided) => (
                                                    <div
                                                        {...checkboxDropProvided.droppableProps}
                                                        ref={checkboxDropProvided.innerRef}
                                                        className="flex flex-col gap-3 mt-2"
                                                    >
                                                        {(items ?? []).map(
                                                            (item: any, ind: number) => (
                                                                <Draggable
                                                                    key={ind}
                                                                    draggableId={item}
                                                                    index={ind}
                                                                    isDragDisabled={previewOn}
                                                                >
                                                                    {(checkboxDragProvided) => (

                                                                        <div
                                                                            ref={checkboxDragProvided.innerRef}
                                                                            {...checkboxDragProvided.draggableProps}
                                                                            {...checkboxDragProvided.dragHandleProps}

                                                                        >
                                                                            <FormField
                                                                                key={ind}
                                                                                control={form.control}
                                                                                name={id}

                                                                                render={({ field }) => {
                                                                                    return (
                                                                                        <div className="flex items-center gap-3">
                                                                                            <FormItem
                                                                                                key={ind}
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
                                                                                                defaultLabel={item}
                                                                                                editable={previewOn}
                                                                                                onUpdateLabelContent={onOptionUpdate!}
                                                                                                optionId={ind}
                                                                                                popoverRef={popoverRef!}
                                                                                                required={required}

                                                                                            />
                                                                                        </div>
                                                                                    )
                                                                                }}
                                                                            />
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
                                        {!previewOn && <Button type="button" className="mt-2 max-w-1/4" variant="ghost" onClick={() => { onOptionsUpdate!(id, [...items ?? [], "Choice" + (items ?? []).length]) }} >
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