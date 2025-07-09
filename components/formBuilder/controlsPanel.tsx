import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, CardContent } from "../ui/card";
import { Droppables, Fields } from "./types";
import { ReactNode } from "react";

export function ControlsPanel({ fields }: { fields: Fields[] }) {
    return (
        <Droppable
            droppableId={Droppables.Fields}
            isDropDisabled={true}
        >
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-row flex-wrap gap-x-3 gap-y-6 px-6 cursor-pointer">
                    {fields.map((f, i) => (
                        <Draggable
                            key={f.name}
                            draggableId={f.name}
                            index={i}>
                            {(provided, snapshot) => (
                                <>
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <SelectBlock><f.icon /> {f.displayName}</SelectBlock>
                                    </div>
                                    {snapshot.isDragging &&
                                        <SelectBlock><f.icon /> {f.displayName}</SelectBlock>

                                    }
                                </>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </Card>
            )}
        </Droppable>
    )
}

function SelectBlock({ children }: { children: ReactNode }) {
    return (
        <CardContent className="px-0 w-32">
            <Card className="py-2">
                <CardContent className="px-4 flex gap-2" >{children}</CardContent>
            </Card>
        </CardContent>
    )
}
