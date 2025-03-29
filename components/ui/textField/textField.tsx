import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Draggable } from "@hello-pangea/dnd";

export default function TextField({ form, name, label, placeholder, description, index, previewOn }: {
    form: any
    name: string
    label: string
    placeholder: string
    description: string
    index: number
    previewOn: boolean
}) {

    return (
        <Draggable draggableId={name} index={index} isDragDisabled={previewOn} >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <FormField
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                            <FormItem
                                className={`bg-white ${!previewOn && 'rounded-sm border-2 border-sky-100 hover:border-sky-600 p-4'} ${snapshot.isDragging && 'border-sky-600'}`}
                            >
                                <FormLabel>{label}</FormLabel>
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