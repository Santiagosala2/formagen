"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, Controller, ControllerProps, FieldPath, FieldValues, Control } from "react-hook-form"
import { any, z, ZodObjectDef } from "zod"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import TextField from "../fields/textField"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { ReactNode, useCallback, useState } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { atom, Provider, useAtom } from "jotai"
import { Blocks, Bold, Calendar, Check, Eye, LetterText, Loader2Icon, Save, Trash } from "lucide-react"
import { v4 as uuid } from 'uuid';
import useOutsideClick from "@/hooks/useOutsideClick"
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
    PropertiesTypes,
    QuestionStringPropsKeys,
    DateQuestion,

} from "./types"
import { Property } from "./property"
import { DateField } from "../fields/dateField"
import React from "react"
import { Toaster } from "../ui/sonner"
import { toast } from "sonner"
import FormTitleEditor from "../editors/formTitleEditor"
import DescriptionEditor from "../editors/descriptionEditor"
import { CheckboxField } from "../fields/checkboxField"
import FormNameEditor from "../editors/formNameEditor"
import services from "@/services/form"
import { Form as FormType } from "../formsTable/types"

import { FormModifiedItem } from "../ui/formItem"
import { Message } from "@/services/common"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

const fieldsList: Fields[] = [
    {
        name: DraggableFields.Text,
        displayName: 'Text',
        icon: LetterText

    },
    {
        name: DraggableFields.Date,
        displayName: 'Date',
        icon: Calendar
    },
    {
        name: DraggableFields.Checkbox,
        displayName: 'Checkbox',
        icon: Check
    }

]

export function FormBuilder({
    id,
    name,
    title,
    description,
    questions,
    initialValues,
    validationSchema
}: {
    id?: string
    name: string | undefined,
    title: string | undefined,
    description: string | undefined,
    questions: Question[],
    initialValues: any,
    validationSchema: any
}) {
    const [formName, setFormName] = useState(name)
    const [formTitle, setFormTitle] = useState(title)
    const [formDescription, setFormDecription] = useState(description)
    const [questionsAdded, setQuestionsAdded] = useState<Question[]>(questions)
    const [selectedQuestion, setSelectedQuestion] = useState<Question>()
    const [fieldsd] = useState<Fields[]>(fieldsList);
    const [previewOn, setPreviewOn] = useState(false);
    const [validationFormSchema, setValidationFormSchema] = useState(validationSchema);
    const [defaultValues] = useState(initialValues)
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm({
        resolver: UpdateResolver(validationFormSchema),
        defaultValues: defaultValues
    })

    const propertiesForm = useForm<PropertiesProps>(
        {

            mode: "onChange"
        })

    function onSubmit(values: { [key: string]: any }) {
        let submitObj: any = {};
        const questionsAddedIds = questionsAdded.map(e => e.id);
        for (var key of Object.keys(values)) {
            let currentQuestion = questionsAdded.filter(q => q.id === key)[0]
            submitObj[currentQuestion.name || currentQuestion.type + (questionsAddedIds.indexOf(currentQuestion.id) + 1)] = values[key]
        }

        toast((<SubmitToastBlock>{JSON.stringify(submitObj, null, 2)}</SubmitToastBlock>))


        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(submitObj)
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
    const [outsideFormClickRef, propertiesRef, popoverRef] = useOutsideClick(() => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            q.selected = false
            return q
        })
        setSelectedQuestion(undefined)
        setQuestionsAdded(updatedQuestionsAdded)
    })

    // for selecting a question      
    const handleSelectQuestion = (fieldType: FieldTypes, id: string) => {
        let selectingQuestion: Question | undefined;
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === id) {
                q.selected = true
                selectingQuestion = q
            } else {
                q.selected = false
            }
            return q
        })

        propertiesForm.reset({
            Required: selectingQuestion!.required,
            NameContent: selectingQuestion!.name || selectingQuestion?.type! + (questionsAdded.map(e => e.id).indexOf(selectingQuestion?.id!) + 1),
            Placeholder: !!selectingQuestion!.placeholder,
            PlaceholderContent: selectingQuestion!.placeholder,
            Description: !!selectingQuestion!.description,
            DescriptionContent: selectingQuestion!.description,
            Long: selectingQuestion?.type === DraggableFields.Text && selectingQuestion.long,
            DateRestriction: selectingQuestion?.type === DraggableFields.Date && selectingQuestion.dateRestriction


        })


        setSelectedQuestion(selectingQuestion)
        setQuestionsAdded(updatedQuestionsAdded)




    }

    const handleFormNameUpdate = useCallback((content: string) => setFormName(content), [])
    const handleFormTitleUpdate = useCallback((content: string) => setFormTitle(content), [])

    const handleFormDescriptionUpdate = useCallback((content: string) => setFormDecription(content), [])


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

    const handleDateRulesChanges = (checked: boolean, value?: "past" | "future") => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            const question = q as DateQuestion
            if (question.id === selectedQuestion!.id) {
                question.dateRestriction = checked
                if (value) question.dateRestrictionRule = value
            }
            return q
        })
        setQuestionsAdded(updatedQuestionsAdded);
    }



    const handlePropertyTextUpdate = useDebouncedCallback((content: string, id: string, property: QuestionStringPropsKeys) => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            if (q.id === id) {
                q[property!] = content
                setSelectedQuestion(q)
            }
            return q
        })
        console.log(selectedQuestion)
        setQuestionsAdded(updatedQuestionsAdded)
    }, 500)

    const handleDeleteQuestion = useCallback((id: string) => {
        propertiesForm.reset()
        setSelectedQuestion(undefined)
        setQuestionsAdded(questionsAdded.filter(q => q.id !== id))

    }, [questionsAdded])


    const handleSaveForm = useDebouncedCallback(async () => {

        const currentForm = {
            id: id!,
            name: formName!,
            title: formTitle,
            description: formDescription,
            questions: questionsAdded.map(q => ({
                ...q,
                name: q!.name || q?.type! + (questionsAdded.map(e => e.id).indexOf(q?.id!) + 1)
            }))

        }
        const saveResponse = await services.saveForm(currentForm) as Message
        if (saveResponse.statusCode === 200) {
            toast.success("Form saved")
        } else {
            toast.error(saveResponse.message)
        }
        setIsSaving(false)
    }, 500)


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
                                            className="flex-row flex-wrap gap-x-3 gap-y-6 px-6 cursor-pointer">
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
                            </TabsContent>
                            <TabsContent value={ControlPanel.Properties}>
                                <Card ref={propertiesRef} className="px-6 gap-y-3">
                                    <Form {...propertiesForm}>
                                        <Property
                                            type={PropertiesTypes.Text}
                                            label="Name"
                                            control={propertiesForm.control}
                                            fieldName="NameContent"
                                            fieldDefaultValue={selectedQuestion?.name}
                                            fieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "name")}
                                            validationRules={{
                                                validate: (value) => {
                                                    if (typeof value !== "string") {
                                                        return true;
                                                    }
                                                    if (value.includes(' ')) {
                                                        return 'Contains spaces';
                                                    }
                                                    // if (questionsAdded.some((el => selectedQuestion!.id !== el.id && el.name === value))) {
                                                    //     return "needs to be unique"
                                                    // }
                                                    return true;
                                                }
                                            }}
                                        />
                                        <Property
                                            type={PropertiesTypes.Switch}
                                            name="Required"
                                            control={propertiesForm.control}
                                            defaultValue={!!selectedQuestion?.required}
                                            switchCheckedOnChange={(checked) => handleRequiredChanges(checked)}
                                            textField={false}
                                        />
                                        {selectedQuestion?.type !== DraggableFields.Checkbox && <Property
                                            type={PropertiesTypes.Switch}
                                            name="Placeholder"
                                            control={propertiesForm.control}
                                            defaultValue={!!selectedQuestion?.placeholder}
                                            switchCheckedOnChange={(checked) => {
                                                if (!checked) {
                                                    handlePropertyTextUpdate("", selectedQuestion!.id, "placeholder");
                                                    propertiesForm.setValue("PlaceholderContent", undefined)
                                                }
                                            }}
                                            textField
                                            textFieldName="PlaceholderContent"
                                            textFieldDefaultValue={selectedQuestion?.placeholder}
                                            textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "placeholder")}
                                        />}
                                        <Property
                                            type={PropertiesTypes.Switch}
                                            name="Description"
                                            control={propertiesForm.control}
                                            defaultValue={!!selectedQuestion?.description}
                                            switchCheckedOnChange={(checked) => {
                                                if (!checked) {
                                                    handlePropertyTextUpdate("", selectedQuestion!.id, "description");
                                                    propertiesForm.setValue("DescriptionContent", undefined)
                                                }
                                            }}
                                            textField
                                            textFieldName="DescriptionContent"
                                            textFieldDefaultValue={selectedQuestion?.description}
                                            textFieldOnChange={(e) => handlePropertyTextUpdate(e, selectedQuestion!.id, "description")}
                                        />
                                        {selectedQuestion?.type === DraggableFields.Text && (
                                            <Property
                                                type={PropertiesTypes.Switch}
                                                name="Long"
                                                control={propertiesForm.control}
                                                defaultValue={!!selectedQuestion?.long}
                                                switchCheckedOnChange={(checked) => handleTextChanges(checked)}
                                                textField={false}
                                            />
                                        )
                                        }
                                        {selectedQuestion?.type === DraggableFields.Date && (
                                            <Property
                                                type={PropertiesTypes.Switch}
                                                name="DateRestriction"
                                                displayName="Date restriction"
                                                control={propertiesForm.control}
                                                defaultValue={selectedQuestion?.dateRestriction ?? false}
                                                switchCheckedOnChange={(checked) => handleDateRulesChanges(checked, selectedQuestion.dateRestrictionRule ?? "past")}
                                                textField={false}
                                                children={
                                                    <ToggleGroup type="single" value={selectedQuestion.dateRestrictionRule ?? "past"} onValueChange={(val: any) => handleDateRulesChanges(true, val)} >
                                                        <ToggleGroupItem value="past" aria-label="Toggle past date rule">
                                                            Past
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem value="future" aria-label="Toggle future date rule">
                                                            Future
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                }
                                            />
                                        )
                                        }

                                        <Property
                                            type={PropertiesTypes.Button}
                                            onClick={() => handleDeleteQuestion(selectedQuestion!.id)}
                                            label="Delete"
                                            icon={<Trash className="text-destructive" width={30} />}
                                        />
                                    </Form>
                                </Card>
                            </TabsContent>
                        </Tabs>

                    </div>}
                    <div className="w-full max-w-screen-sm">
                        <div className="flex justify-between" >
                            <div className="flex items-center gap-2" >
                                <FormNameEditor
                                    defaultLabel={formName}
                                    onUpdateContent={handleFormNameUpdate}
                                    editable={previewOn}
                                />

                                <Button variant="outline" className="mb-2" onClick={handleSwitchMode} >
                                    {!previewOn ? (
                                        <>
                                            <Eye />
                                            Preview
                                        </>
                                    ) : (
                                        <>
                                            <Blocks />
                                            Builder
                                        </>
                                    )}
                                </Button>
                            </div>
                            {id && !previewOn && <Button variant="outline" disabled={isSaving} onClick={() => { setIsSaving(true); handleSaveForm() }} >
                                {!isSaving ?
                                    <Save /> :
                                    <Loader2Icon className="animate-spin" />
                                }
                                Save
                            </Button>}
                        </div>
                        <Card ref={outsideFormClickRef}>
                            <CardContent>
                                {<div className="flex flex-row justify-start mb-6">
                                    <FormTitleEditor
                                        defaultLabel={formTitle}
                                        onUpdateContent={handleFormTitleUpdate}
                                        editable={previewOn}
                                    />
                                </div>}
                                {((!previewOn) || (previewOn && formDescription !== "<p></p>")) && <div className="flex flex-row justify-start mb-6">
                                    <DescriptionEditor
                                        defaultValue={formDescription}
                                        onUpdateContent={handleFormDescriptionUpdate}
                                        editable={previewOn}
                                        popoverRef={popoverRef}
                                    />
                                </div>}
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

                                                    <React.Fragment key={q.id} >
                                                        {q.type === DraggableFields.Text &&
                                                            <TextField
                                                                {...q}
                                                                form={form.control}
                                                                index={i}
                                                                previewOn={previewOn}
                                                                selected={q.selected}
                                                                onUpdateLabelContent={handleLabelContentUpdate}
                                                                onSelectQuestion={() => handleSelectQuestion(q.type, q.id)}
                                                                popoverRef={popoverRef}

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
                                                                popoverRef={popoverRef}

                                                            />
                                                        }
                                                        {q.type === DraggableFields.Checkbox &&
                                                            <CheckboxField
                                                                {...q}
                                                                form={form.control}
                                                                index={i}
                                                                previewOn={previewOn}
                                                                selected={q.selected}
                                                                onUpdateLabelContent={handleLabelContentUpdate}
                                                                onSelectQuestion={() => handleSelectQuestion(q.type, q.id)}
                                                                popoverRef={popoverRef}

                                                            />
                                                        }


                                                    </React.Fragment>

                                                ))}

                                                {provided.placeholder}
                                                {questionsAdded.length === 0 &&
                                                    <Card
                                                        className="rounded-sm border-1 border-sky-400 border-dashed  p-4"
                                                    >
                                                        Drop a question here
                                                    </Card>
                                                }
                                                <Button disabled={!previewOn} type="submit">Submit</Button>
                                            </form>
                                        )}
                                    </Droppable>
                                </Form>
                            </CardContent>
                        </Card>
                        <Toaster position={previewOn ? "bottom-right" : "bottom-center"} />
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
                <CardContent className="px-4 flex gap-2" >{children}</CardContent>
            </Card>
        </CardContent>
    )
}

function SubmitToastBlock({ children }: { children: ReactNode }) {
    return (<div className="grid gap-1">
        <div className="text-sm font-semibold">You submitted the following values:</div>
        <div className="text-sm opacity-90">
            <pre className="mt-2 w-[320px] rounded-md bg-slate-950 p-4">
                <code className="text-white">
                    {children}
                </code>
            </pre>
        </div>
    </div>)
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

    //newQuestion.name = DraggableFields[draggableId]
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



// Changing schema functions

export function MakeFieldRequired(fieldName: string, type: FieldTypes) {
    let schema;
    switch (type) {
        case DraggableFields.Text:
            schema = z.string().min(1);
            break;
        case DraggableFields.Date:
            schema = z.date();
            break;
        case DraggableFields.Checkbox:
            schema = z.literal<boolean>(true)
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

export function MakeFieldNotRequired(fieldName: string, type: FieldTypes) {
    let schema;
    switch (type) {
        case DraggableFields.Text:
            schema = z.string().optional()
            break;
        case DraggableFields.Date:
            schema = z.date().optional()
            break;
        case DraggableFields.Checkbox:
            schema = z.boolean().optional()
        default:
            break;
    }
    return { [fieldName]: schema }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}



