"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, Controller, ControllerProps, FieldPath, FieldValues, Control } from "react-hook-form"
import { any, z } from "zod"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import TextField from "../fields/textField"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { ReactNode, useCallback } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { atom, Provider, useAtom } from "jotai"
import { Blocks, Eye, Trash2 } from "lucide-react"
import { v4 as uuid } from 'uuid';
import useOutsideClick from "@/components/hooks/useOutsideClick"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { useDebouncedCallback } from "use-debounce"
import {
    Question,
    DraggableFields,
    Droppables,
    ControlPanel,
    Fields,
    FieldTypes,
    PropertiesProps,
    TextQuestion,
    DateQuestion

} from "./types"
import { Property } from "./property"
import { DateField } from "../fields/dateField"
import React from "react"

const questionsAddedList: Question[] = [
    {
        id: `1`,
        name: 'username',
        label: "Question1",
        placeholder: "placeholder q1",
        description: "",
        type: DraggableFields.Text,
        selected: false,
        required: true,
        defaultValue: undefined
    },
    {
        id: `2`,
        name: 'firstname',
        label: "Question2",
        placeholder: "placeholder q2",
        description: "",
        type: DraggableFields.Text,
        selected: false,
        required: false,
        defaultValue: undefined
    },
    {
        id: `3`,
        name: 'whatever',
        label: "Question3",
        placeholder: "placeholder q3",
        description: "d",
        type: DraggableFields.Text,
        selected: false,
        required: false,
        defaultValue: undefined
    },
]

const fieldsList: Fields[] = [
    {
        name: DraggableFields.Text,
        displayName: 'Text',

    },
    {
        name: DraggableFields.Date,
        displayName: 'Date'
    }
]


const questionsAddedAtom = atom(questionsAddedList);
const fieldsAtom = atom(fieldsList);
const selectedQuestionAtom = atom<Question>()
const previewOnAtom = atom(false);
const validationFormSchemaAtom = atom({
    '1': z.string().min(1)
})

const defaultValuesObj: any = {}

questionsAddedList.forEach(el => defaultValuesObj[el.id] = el.defaultValue)

const defaultValuesAtom = atom<any>(defaultValuesObj)





export function FormBuilder() {
    const [questionsAdded, setQuestionsAdded] = useAtom<Question[]>(questionsAddedAtom)
    const [selectedQuestion, setSelectedQuestion] = useAtom(selectedQuestionAtom)
    const [fieldsd] = useAtom<Fields[]>(fieldsAtom);
    const [previewOn, setPreviewOn] = useAtom(previewOnAtom);
    const [validationFormSchema, setValidationFormSchema] = useAtom(validationFormSchemaAtom);
    const [defaultValues] = useAtom(defaultValuesAtom)


    const form = useForm({
        resolver: UpdateResolver(validationFormSchema),
        defaultValues: defaultValues
    })

    const propertiesForm = useForm<PropertiesProps>()

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
                const newQuestion = AddQuestion(draggableId as FieldTypes)
                const questionsAddedCopy = CloneArray(questionsAdded);
                questionsAddedCopy.splice(destination.index, 0, newQuestion)
                setQuestionsAdded(questionsAddedCopy)
                const requiredSchema = MakeFieldRequired(newQuestion.id, newQuestion.type)
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
        propertiesForm.reset()

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
            newSchema = MakeFieldRequired(selectedQuestion!.id, selectedQuestion!.type)
        } else {
            newSchema = MakeFieldNotRequired(selectedQuestion!.id, selectedQuestion!.type)
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

    const handleTextChanges = (checked: boolean) => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            const question = q as TextQuestion
            if (question.id === selectedQuestion!.id) {
                question.long = checked
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded);
    }


    const handlePropertyTextUpdate = useDebouncedCallback((content: string, id: string, property: "placeholder" | "description") => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === id) {
                q[property] = content
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded)
    }, 500)

    const handleDeleteQuestion = useCallback((id: string) => {
        propertiesForm.reset()
        setSelectedQuestion(undefined)
        setQuestionsAdded(questionsAdded.filter(q => q.id !== id))

    }, [questionsAdded])

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
                                    <Property
                                        type="Switch"
                                        name="Required"
                                        control={propertiesForm.control}
                                        defaultValue={!!selectedQuestion?.required}
                                        switchCheckedOnChange={(checked) => handleRequiredChanges(checked)}
                                        textField={false}
                                    />
                                    <Property
                                        type="Switch"
                                        name="Placeholder"
                                        control={propertiesForm.control}
                                        defaultValue={!!selectedQuestion?.placeholder}
                                        switchCheckedOnChange={(checked) => {
                                            if (!checked) {
                                                handlePropertyTextUpdate("", selectedQuestion!.id, "placeholder");
                                                propertiesForm.resetField("PlaceholderContent")
                                            }
                                        }}
                                        textField
                                        textFieldName="PlaceholderContent"
                                        textFieldDefaultValue={selectedQuestion?.placeholder}
                                        textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "placeholder")}
                                    />
                                    <Property
                                        type="Switch"
                                        name="Description"
                                        control={propertiesForm.control}
                                        defaultValue={!!selectedQuestion?.description}
                                        switchCheckedOnChange={(checked) => {
                                            if (!checked) {
                                                handlePropertyTextUpdate("", selectedQuestion!.id, "description");
                                                propertiesForm.resetField("DescriptionContent")
                                            }
                                        }}
                                        textField
                                        textFieldName="DescriptionContent"
                                        textFieldDefaultValue={selectedQuestion?.description}
                                        textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "description")}
                                    />
                                    {selectedQuestion?.type === DraggableFields.Text && (
                                        <Property
                                            type="Switch"
                                            name="Long"
                                            control={propertiesForm.control}
                                            defaultValue={!!selectedQuestion?.long}
                                            switchCheckedOnChange={(checked) => handleTextChanges(checked)}
                                            textField={false}
                                        />


                                    )



                                    }

                                    <Property
                                        type="Button"
                                        onClick={() => handleDeleteQuestion(selectedQuestion!.id)}
                                        label="Delete"
                                        icon={<Trash2 width={30} />}
                                    />

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

                                                    <React.Fragment key={q.id}>
                                                        {q.type === DraggableFields.Text &&
                                                            <TextField
                                                                {...q}
                                                                form={form.control}
                                                                index={i}
                                                                previewOn={previewOn}
                                                                selected={q.selected}
                                                                onUpdateLabelContent={handleLabelContentUpdate}
                                                                onSelectQuestion={() => handleSelectQuestion(q.type, q.id)}
                                                                outsideFormClickRef={outSideNullableFormClickRef}
                                                            />
                                                        }
                                                        {q.type === DraggableFields.Date &&
                                                            <DateField
                                                                {...q}
                                                                form={form.control}
                                                                index={i}
                                                                previewOn={previewOn}
                                                                selected={q.selected}
                                                                onUpdateLabelContent={handleLabelContentUpdate}
                                                                onSelectQuestion={() => handleSelectQuestion(q.type, q.id)}
                                                                outsideFormClickRef={outSideNullableFormClickRef}
                                                            />
                                                        }


                                                    </React.Fragment>

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



function AddQuestion(draggableId: FieldTypes) {
    const newQuestion: Question = {
        id: uuid(),
        name: "",
        label: "",
        placeholder: "",
        description: "",
        type: DraggableFields[draggableId],
        selected: true,
        required: true,
        defaultValue: undefined
    }

    newQuestion.name = `${newQuestion.id}`
    newQuestion.label = DraggableFields[draggableId]

    switch (draggableId) {
        case DraggableFields.Text:

            break;

        default:
            break;
    }

    React.Fragment

    return newQuestion
}

function MoveQuestion(draggableId: string, destinationIndex: number, sourceIndex: number, questionsAdded: Question[]) {

    // Move already added questions around
    const questionsAddedCopy = CloneArray(questionsAdded);
    const getQuestion = questionsAddedCopy.filter(n => n.id === draggableId)[0]
    questionsAddedCopy.splice(sourceIndex, 1);
    questionsAddedCopy.splice(destinationIndex, 0, getQuestion)
    return questionsAddedCopy
}


function CloneArray(questionsAdded: Question[]) {
    return [...questionsAdded]
}

function MakeFieldRequired(fieldName: string, type: FieldTypes) {
    let schema;
    switch (type) {
        case DraggableFields.Text:
            schema = z.string().min(1);
            break;
        case DraggableFields.Date:
            schema = z.date();
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

function MakeFieldNotRequired(fieldName: string, type: FieldTypes) {
    let schema;
    switch (type) {
        case DraggableFields.Text:
            schema = z.string().optional()
            break;
        case DraggableFields.Date:
            schema = z.date().optional()
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}



