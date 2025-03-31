"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "../form"
import TextField from "../textField/textField"
import { Button } from "../button"
import { Card, CardContent } from "../card"
import { ReactNode } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { atom, Provider, useAtom } from "jotai"
import { Blocks, Eye, View } from "lucide-react"
import { v4 as uuid } from 'uuid';


enum Droppables {
    Questions = "Questions",
    Fields = "Fields"
}

enum DraggableFields {
    SingleText = "SingleText",
    MultiText = "MultiText",
    Date = "Date"
}

interface Questions {
    id: string,
    name: string
    label: string
    placeholder: string
    description: string
}

interface Fields {
    name: string
    displayName: string
}

interface SingleText extends Questions {
    type: DraggableFields.SingleText
}



const questionsAddedList: Questions[] = [
    {
        id: `1`,
        name: 'username',
        label: "Question1",
        placeholder: "placeholder q1",
        description: "",
    },
    {
        id: `2`,
        name: 'firstname',
        label: "Question2",
        placeholder: "placeholder q2",
        description: "",
    },
    {
        id: `3`,
        name: 'lastname',
        label: "Question3",
        placeholder: "placeholder q3",
        description: "d",
    },
]

const fieldsList: Fields[] = [
    {
        name: 'SingleText',
        displayName: 'Single Text'
    }
]


const questionsAddedAtom = atom(questionsAddedList);
const fieldsAtom = atom(fieldsList);
const previewOnAtom = atom(false);


const formSchema = z.object({
    username: z.string().min(2).max(50),

})


export function FormBuilder() {
    const [questionsAdded, setQuestionsAdded] = useAtom<Questions[]>(questionsAddedAtom)
    const [fields, setFields] = useAtom<Fields[]>(fieldsAtom);
    const [previewOn, setPreviewOn] = useAtom(previewOnAtom);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    function onDragEnd(result: DropResult<string>) {
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

        switch (source.droppableId) {
            case Droppables.Fields:
                setQuestionsAdded(
                    AddQuestion(
                        DraggableFields.SingleText,
                        destination.index,
                        questionsAdded
                    )
                )
                break;

            default:
                // Move already added questions around
                setQuestionsAdded(
                    MoveQuestion(
                        draggableId,
                        destination.index,
                        source.index,
                        questionsAdded
                    )
                )
                break;
        }
    }


    function onSwitchMode() {
        setPreviewOn(!previewOn)
    }

    return (
        <>
            <Provider>
                <DragDropContext
                    onDragEnd={onDragEnd}

                >
                    {!previewOn && <div className="w-full max-w-xs">

                        <Droppable
                            droppableId={Droppables.Fields}
                            isDropDisabled={true}
                        >
                            {(provided, snapshot) => (

                                <Card
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-row flex-wrap gap-x-3 gap-y-6 px-6">
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
                                                        <SelectBlock>{f.displayName}</SelectBlock>
                                                    </div>
                                                    {snapshot.isDragging &&
                                                        <SelectBlock>{f.displayName}</SelectBlock>

                                                    }

                                                </>


                                            )}
                                        </Draggable>

                                    ))}
                                    {provided.placeholder}
                                </Card>
                            )}
                        </Droppable>
                    </div>}
                    <div className="w-full max-w-screen-sm">
                        <Button variant="outline" className="mb-2" onClick={onSwitchMode} >
                            {!previewOn && <Eye />}{!previewOn && "Preview"}
                            {previewOn && <Blocks />}{previewOn && "Builder"}
                        </Button>
                        <Card>
                            <CardContent>
                                <Form {...form}>
                                    <Droppable
                                        droppableId={Droppables.Questions}
                                        isDropDisabled={previewOn}
                                    >
                                        {provided => (
                                            <form
                                                onSubmit={form.handleSubmit(onSubmit)}
                                                className="space-y-8"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {questionsAdded.map((q, i) => (
                                                    <TextField
                                                        id={q.id}
                                                        key={q.id}
                                                        form={form.control}
                                                        name={q.name}
                                                        label={q.label}
                                                        placeholder={q.placeholder}
                                                        description={q.description}
                                                        index={i}
                                                        previewOn={previewOn}

                                                    />
                                                ))}
                                                {provided.placeholder}
                                                <Button type="submit">Submit</Button>
                                            </form>
                                        )}
                                    </Droppable>
                                </Form>

                            </CardContent>
                        </Card>

                    </div>
                </DragDropContext>
            </Provider>
        </>
    )
}

function SelectBlock({ children }: { children: ReactNode }) {
    return (
        <CardContent className="px-0 w-32">
            <Card className="py-2">
                <CardContent className="px-4" >{children}</CardContent>
            </Card>
        </CardContent>
    )
}

function AddQuestion(draggableId: keyof typeof DraggableFields, destinationIndex: number, questionsAdded: Questions[]) {
    const questionsAddedCopy = CloneArray(questionsAdded);
    const newQuestion: Questions = {
        id: uuid(),
        name: "",
        label: "",
        placeholder: "",
        description: "",
    }
    switch (draggableId) {
        case DraggableFields.SingleText:
            newQuestion.name = "Text"
            newQuestion.label = "Text"
            break;

        default:
            break;
    }

    questionsAddedCopy.splice(destinationIndex, 0, newQuestion)
    return questionsAddedCopy
}

function MoveQuestion(draggableId: string, destinationIndex: number, sourceIndex: number, questionsAdded: Questions[]) {

    // Move already added questions around
    const questionsAddedCopy = CloneArray(questionsAdded);
    const getQuestion = questionsAddedCopy.filter(n => n.id === draggableId)[0]
    questionsAddedCopy.splice(sourceIndex, 1);
    questionsAddedCopy.splice(destinationIndex, 0, getQuestion)
    return questionsAddedCopy
}


function CloneArray(questionsAdded: Questions[]) {
    return [...questionsAdded]
}