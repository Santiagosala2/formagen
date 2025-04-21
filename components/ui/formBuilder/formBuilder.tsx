"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { any, z } from "zod"
import { Form } from "../form"
import TextField from "../textField/textField"
import { Button } from "../button"
import { Card, CardContent } from "../card"
import { ReactNode, useCallback } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { atom, Provider, useAtom } from "jotai"
import { Blocks, Eye } from "lucide-react"
import { v4 as uuid } from 'uuid';
import useOutsideClick from "@/hooks/useOutsideClick"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"
import { Switch } from "../switch"
import { Label } from "../label"
import { Separator } from "../separator"
import * as SwitchPrimitive from "@radix-ui/react-switch"


enum Droppables {
    Questions = "Questions",
    Fields = "Fields",
    Bin = "Bin"
}

enum DraggableFields {
    SingleText = "SingleText",
    MultiText = "MultiText",
    Date = "Date"
}

enum ControlPanel {
    Fields = "Fields",
    Properties = "Properties"
}

type FieldTypes = keyof typeof DraggableFields

interface Questions {
    id: string,
    name: string
    label: string
    placeholder: string
    description: string
    type: FieldTypes
    selected: boolean
    required: boolean
}

interface Fields {
    name: FieldTypes
    displayName: string
}

const questionsAddedList: Questions[] = [
    {
        id: `1`,
        name: 'username',
        label: "Question1",
        placeholder: "placeholder q1",
        description: "",
        type: "SingleText",
        selected: false,
        required: true
    },
    {
        id: `2`,
        name: 'firstname',
        label: "Question2",
        placeholder: "placeholder q2",
        description: "",
        type: "SingleText",
        selected: false,
        required: false
    },
    {
        id: `3`,
        name: 'whatever',
        label: "Question3",
        placeholder: "placeholder q3",
        description: "d",
        type: "SingleText",
        selected: false,
        required: false
    },
]

const fieldsList: Fields[] = [
    {
        name: DraggableFields.SingleText,
        displayName: 'Text'
    }
]


const questionsAddedAtom = atom(questionsAddedList);
const fieldsAtom = atom(fieldsList);
const selectedQuestionAtom = atom<Questions>()
const previewOnAtom = atom(false);
const validationFormSchemaAtom = atom({
    '1': z.string().min(1)
})
const defaultValuesAtom = atom<any>({ '1': '' })



export function FormBuilder() {
    const [questionsAdded, setQuestionsAdded] = useAtom<Questions[]>(questionsAddedAtom)
    const [selectedQuestion, setSelectedQuestion] = useAtom(selectedQuestionAtom)
    const [fieldsd] = useAtom<Fields[]>(fieldsAtom);
    const [previewOn, setPreviewOn] = useAtom(previewOnAtom);
    const [validationFormSchema, setValidationFormSchema] = useAtom(validationFormSchemaAtom);
    const [defaultValues] = useAtom(defaultValuesAtom)


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

    // for unselecting selected question - when clicking outside
    const [outsideFormClickRef, outSideNullableFormClickRef] = useOutsideClick(() => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            q.selected = false
            return q
        })
        setSelectedQuestion(undefined)
        setQuestionsAdded(updatedQuestionsAdded)
    })

    // for selecting a question      
    const handleSelectQuestion = (fieldType: FieldTypes, id: string) => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === id) {
                q.selected = true
                setSelectedQuestion(q)
            } else {
                q.selected = false
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded)

        // for the properties panel 
        if (fieldType === DraggableFields.SingleText) {

        }

    }


    const handleLabelContentUpdate = useCallback((content: string, id: string) => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === id) {
                q.label = content
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded)
    }, [questionsAdded])


    function handleSwitchMode() {
        if (previewOn) {
            form.reset()
        }
        setPreviewOn(!previewOn)
    }

    //
    const handleRequiredChanges = (checked: boolean) => {
        let newSchema;
        if (checked) {
            newSchema = MakeFieldRequired(selectedQuestion!.id)
        } else {
            newSchema = MakeFieldNotRequired(selectedQuestion!.id)
        }
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === selectedQuestion!.id) {
                q.required = checked
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded);
        setValidationFormSchema({ ...validationFormSchema, ...newSchema })
    }


    return (
        <>
            <Provider>
                <DragDropContext
                    onDragEnd={onDragEnd}

                >
                    {!previewOn && <div className="w-full max-w-xs">
                        <Tabs defaultValue={ControlPanel.Fields} value={selectedQuestion ? ControlPanel.Properties : ControlPanel.Fields}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value={ControlPanel.Fields}>{ControlPanel.Fields}</TabsTrigger>
                                <TabsTrigger disabled={!selectedQuestion} value={ControlPanel.Properties}>{ControlPanel.Properties}</TabsTrigger>
                            </TabsList>
                            <TabsContent value={ControlPanel.Fields}>
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
                            </TabsContent>
                            <TabsContent value={ControlPanel.Properties}>
                                <Card ref={outSideNullableFormClickRef} className="px-6 gap-y-3">
                                    <PropertyBlock name="Required" onCheckedChange={handleRequiredChanges}
                                        checked={selectedQuestion?.required}
                                    />
                                    <PropertyBlock name="Description" />
                                </Card>
                            </TabsContent>
                        </Tabs>

                    </div>}
                    <div className="w-full max-w-screen-sm">
                        <Button variant="outline" className="mb-2" onClick={handleSwitchMode} >
                            {!previewOn ? (
                                <>
                                    Preview
                                    <Eye />
                                </>
                            ) : (
                                <>
                                    Builder
                                    <Blocks />
                                </>
                            )}
                        </Button>
                        <Card ref={outsideFormClickRef}>
                            <CardContent>
                                <Form {...form}>
                                    <Droppable
                                        droppableId={Droppables.Questions}
                                        isDropDisabled={previewOn}
                                    >
                                        {(provided, snapshot) => (
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
                                                        selected={q.selected}
                                                        defaultValue={defaultValues[q.id]}
                                                        onUpdateLabelContent={handleLabelContentUpdate}
                                                        onSelectQuestion={() => handleSelectQuestion(q.type, q.id)}
                                                        outsideFormClickRef={outSideNullableFormClickRef}

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

function PropertyBlock({ ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    const { name } = props
    return (
        <>
            <div className="flex items-center gap-x-3">
                <Switch id={name} {...props} />
                <Label htmlFor={name}>{name}</Label>
            </div>
            <Separator />
        </>
    )
}

function AddQuestion(draggableId: FieldTypes) {
    const newQuestion: Questions = {
        id: uuid(),
        name: "",
        label: "",
        placeholder: "",
        description: "",
        type: DraggableFields.SingleText,
        selected: true,
        required: true
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

function MakeFieldNotRequired(fieldName: string) {
    return { [fieldName]: z.string() }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}



