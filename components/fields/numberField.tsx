"use client";

import { FormControl, FormDescription, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Draggable } from "@hello-pangea/dnd";
import LabelEditor from "../editors/labelEditor";
import { memo } from "react";
import { FieldsProps, NumberQuestion } from "../formBuilder/types";
import { FormModifiedItem } from "../ui/formItem";

const NumberField = ({
  form,
  label,
  placeholder,
  description,
  required,
  selected,
  index,
  previewOn,
  id,
  defaultValue,
  min,
  max,
  step,
  allowDecimals,
  onUpdateLabelContent,
  onSelectQuestion,
  popoverRef,
  view,
}: NumberQuestion & FieldsProps) => {
  return (
    <Draggable draggableId={id} index={index} isDragDisabled={previewOn}>
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
                  <Input
                    type="number"
                    disabled={view || !previewOn}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step ?? (allowDecimals ? "any" : 1)}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormDescription>{description}</FormDescription>
                <FormMessage />
              </FormModifiedItem>
            )}
          />
        </div>
      )}
    </Draggable>
  );
};

export default memo(NumberField);
