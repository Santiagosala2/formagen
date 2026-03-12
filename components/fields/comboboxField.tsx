"use client";

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "../ui/form";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { ChoiceItem, ComboboxQuestion, Droppables, FieldsProps } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";
import { Button } from "../ui/button";
import { ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import OptionEditor from "../editors/optionEditor";
import { useState } from "react";
import { v4 as uuid } from 'uuid';
import { Combobox, ComboboxChip, ComboboxInput, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "../ui/combobox";
import React from "react";


const ComboboxField = ({
    form,
    label,
    description,
    placeholder,
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
    multi,
    onOptionUpdate,
    onOptionsUpdate,
    view
}:
    ComboboxQuestion & FieldsProps) => {
    const anchor = useComboboxAnchor()

    const [parentDisabled, setParentDisabled] = useState(false);
    const [open, setOpen] = useState(false);

    const onDragEnd = (result: DropResult<string>) => {
        const { destination, source, draggableId } = result;
        setParentDisabled(false);

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        const itemsCopy = [...items];
        const getOption = itemsCopy.filter(n => n.id === draggableId)[0];
        itemsCopy.splice(source.index, 1);
        itemsCopy.splice(destination.index, 0, getOption);
        onOptionsUpdate!(id, itemsCopy);
    };

    const deleteChoiceItem = (removeId: string) => {
        const itemsCopy = [...items].filter((el) => el.id !== removeId);
        onOptionsUpdate!(id, itemsCopy);
    };

    const addChoiceItem = () => {
        onOptionsUpdate!(id, [...items, { id: uuid(), item: "Choice" + items.length }]);
    };

    return (
        <Draggable draggableId={id} index={index} isDragDisabled={previewOn || parentDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <FormField
                        control={form.control}
                        name={id}
                        defaultValue={defaultValue ?? (multi ? [] : '')}
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
                                    {previewOn ? (
                                        <Combobox
                                            multiple={multi}
                                            autoHighlight
                                            items={items}
                                            itemToStringValue={(item) => item.item}
                                            value={field.value}

                                            onValueChange={(value: any) => {
                                                field.onChange(value)
                                            }}

                                        >
                                            {!multi && <ComboboxInput placeholder={placeholder} showClear />}
                                            {multi && <ComboboxChips ref={anchor} className="w-full">
                                                <ComboboxValue>
                                                    {(items) => (
                                                        <React.Fragment>
                                                            {items.map((item: string) => (
                                                                <ComboboxChip key={item}>{item}</ComboboxChip>
                                                            ))}
                                                            <ComboboxChipsInput placeholder={placeholder} />
                                                        </React.Fragment>
                                                    )}
                                                </ComboboxValue>
                                            </ComboboxChips>}
                                            <ComboboxContent anchor={anchor}>
                                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem key={item.id} value={item.item}>
                                                            {item.item}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                    ) : (
                                        // Designer mode: editable options list with drag-and-drop
                                        <DragDropContext
                                            onDragEnd={(result) => { onDragEnd(result); setParentDisabled(false); }}
                                            onDragStart={() => setParentDisabled(true)}
                                        >
                                            <Droppable droppableId={Droppables.ComboboxOption}>
                                                {(comboDropProvided) => (
                                                    <div
                                                        {...comboDropProvided.droppableProps}
                                                        ref={comboDropProvided.innerRef}
                                                        className="flex flex-col gap-2 mt-2"
                                                    >
                                                        {items.map((item: ChoiceItem, ind: number) => (
                                                            <Draggable
                                                                key={item.id}
                                                                draggableId={item.id}
                                                                index={ind}
                                                                isDragDisabled={previewOn}
                                                            >
                                                                {(comboDragProvided) => (
                                                                    <div
                                                                        ref={comboDragProvided.innerRef}
                                                                        {...comboDragProvided.draggableProps}
                                                                        {...comboDragProvided.dragHandleProps}
                                                                        className="hover:rounded-sm hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50"
                                                                    >
                                                                        <div className="flex justify-between items-center" key={item.id}>
                                                                            <div className="flex items-center gap-2 pl-1">
                                                                                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex items-center justify-center">
                                                                                    <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                                                                                </div>
                                                                                <OptionEditor
                                                                                    defaultLabel={item.item}
                                                                                    editable={previewOn}
                                                                                    onUpdateLabelContent={onOptionUpdate!}
                                                                                    optionId={item.id}
                                                                                    popoverRef={popoverRef!}
                                                                                    required={required}
                                                                                />
                                                                            </div>
                                                                            <Button type="button" variant="ghost" onClick={() => deleteChoiceItem(item.id)}>
                                                                                <Trash2 />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {comboDropProvided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    )}
                                </FormControl>
                                <FormDescription>{description}</FormDescription>
                                <FormMessage />
                                {!previewOn && (
                                    <Button type="button" className="max-w-1/4 mt-2" variant="ghost" onClick={addChoiceItem}>
                                        <Plus />
                                        Add option
                                    </Button>
                                )}
                            </FormModifiedItem>
                        )}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default ComboboxField;
