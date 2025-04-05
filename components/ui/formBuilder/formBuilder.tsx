"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { any, z } from "zod"
import { Form } from "../form"
import TextField from "../textField/textField"
import { Button } from "../button"
import { Card, CardContent } from "../card"
import { ReactNode, useEffect } from "react"
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
        name: 'whatever',
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
const validationFormSchemaAtom = atom({
    '1': z.string().min(1)
})
const defaultValuesAtom = atom<any>({ '1': '' })



export function FormBuilder() {
    const [questionsAdded, setQuestionsAdded] = useAtom<Questions[]>(questionsAddedAtom)
    const [fieldsd, setFields] = useAtom<Fields[]>(fieldsAtom);
    const [previewOn, setPreviewOn] = useAtom(previewOnAtom);
    const [validationFormSchema, setValidationFormSchema] = useAtom(validationFormSchemaAtom);
    const [defaultValues, setDefaultValues] = useAtom(defaultValuesAtom)


    // 

    // 1. Define your form.
    const form = useForm({
        resolver: UpdateResolver(validationFormSchema),
        defaultValues: defaultValues
    })



    // 2. Define a submit handler.
    function onSubmit(values: any) {
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
                const newQuestion = AddQuestion(DraggableFields.SingleText)
                const questionsAddedCopy = CloneArray(questionsAdded);
                questionsAddedCopy.splice(destination.index, 0, newQuestion)
                setQuestionsAdded(questionsAddedCopy)
                const requiredSchema = MakeFieldRequired(newQuestion.id)
                setValidationFormSchema({ ...validationFormSchema, ...requiredSchema })
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

        if (previewOn) {
            form.reset()
        }

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
                                    {fieldsd.map((f, i) => (
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
                                                        defaultValue={defaultValues[q.id]}

                                                    />
                                                ))}
                                                {provided.placeholder}
                                                <Button disabled={!previewOn} type="submit">Submit</Button>

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

function AddQuestion(draggableId: keyof typeof DraggableFields) {
    const newQuestion: Questions = {
        id: uuid(),
        name: "",
        label: "",
        placeholder: "",
        description: "",
    }
    switch (draggableId) {
        case DraggableFields.SingleText:
            newQuestion.name = `${newQuestion.id}`
            newQuestion.label = "Text"
            break;

        default:
            break;
    }

    return newQuestion
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

function MakeFieldRequired(fieldName: string) {
    return { [fieldName]: z.string().min(1) }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}

