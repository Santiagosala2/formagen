"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, } from "react-hook-form"
import { z, } from "zod"
import { Form, } from "../ui/form"
import TextField from "../fields/textField"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { ReactNode, useCallback, useState } from "react"
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd"
import { Blocks, Calendar, Check, CircleCheck, CircleDotIcon, Eye, LetterText, Loader2Icon, Save, SignatureIcon } from "lucide-react"
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
    QuestionStringPropsKeys,
    DateQuestion,
    RadioQuestion,
    CheckboxQuestion,
    FieldSubtypes,

} from "./types"
import { DateField } from "../fields/dateField"
import React from "react"
import { Toaster } from "../ui/sonner"
import { toast } from "sonner"
import FormTitleEditor from "../editors/formTitleEditor"
import DescriptionEditor from "../editors/descriptionEditor"
import { CheckboxField } from "../fields/checkboxField"
import FormNameEditor from "../editors/formNameEditor"
import services from "@/services/form"
import { Message } from "@/services/common"
import RadioField from "../fields/radioField"
import { PropertiesPanel } from "./propertiesPanel"
import { ControlsPanel } from "./controlsPanel"
import { SubmitForm } from "../formsTable/types"
import SignatureField from "../fields/signatureField"

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
    },
    {
        name: DraggableFields.Radio,
        displayName: 'Radio',
        icon: CircleDotIcon
    },
    {
        name: DraggableFields.Signature,
        displayName: 'Signature',
        icon: SignatureIcon
    }

]

export function FormBuilder({
    id,
    name,
    title,
    description,
    questions,
    initialValues,
    validationSchema,
    submitted = false,
    submit,
    view,
    user
}: {
    id?: string
    name: string | undefined,
    title: string | undefined,
    description: string | undefined,
    questions: Question[],
    initialValues: any,
    validationSchema: any,
    submitted: boolean,
    submit?: boolean,
    view?: boolean,
    user?: { id: string, email: string, isAdmin: boolean }
}) {
    const [formName, setFormName] = useState(name)
    const [formTitle, setFormTitle] = useState(title)
    const [formDescription, setFormDecription] = useState(description)
    const [questionsAdded, setQuestionsAdded] = useState<Question[]>(questions)
    const [selectedQuestion, setSelectedQuestion] = useState<Question>()
    const [previewOn, setPreviewOn] = useState(submit ?? false);
    const [validationFormSchema, setValidationFormSchema] = useState(validationSchema);
    const [defaultValues] = useState(initialValues)
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmiting, setIsSubmiting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(submitted)


    const form = useForm({
        resolver: UpdateResolver(validationFormSchema),
        defaultValues: defaultValues,
    })




    const propertiesForm = useForm<PropertiesProps>(
        {
            mode: "onChange"
        })


    async function onSubmit(values: { [key: string]: any }) {
        const submitObj: any = {};
        const questionsResponse: Question[] = [...questionsAdded]
        const questionsResponseIds = questionsResponse.map(e => e.id);
        for (const key of Object.keys(values)) {
            questionsResponse.map(q => {
                if (q.id === key) {
                    q.name = q.name || q.type + (questionsResponseIds.indexOf(q.id) + 1)
                    q.defaultValue = values[key]
                    submitObj[q.name] = values[key]
                }
                return q
            })
        }
        if (!submit) {
            toast((<SubmitToastBlock>{JSON.stringify(submitObj, null, 2)}</SubmitToastBlock>))
            return
        }
        setIsSubmiting(true)
        const submitForm: SubmitForm = {
            id: id!,
            title: formTitle,
            description: formDescription,
            questions: questionsResponse,
            user: {
                userId: user!.id,
                email: user!.email,
                isAdmin: user!.isAdmin
            }
        }
        const submitResponse = await services.form.submitForm(submitForm)
        if (submitResponse.statusCode === 200) {
            setIsSubmitted(true)
            toast.success("Form submitted")
        }
        setIsSubmiting(false)


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
    const handleSelectQuestion = (id: string) => {
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
        if (!selectingQuestion) return
        propertiesForm.reset({
            Required: selectingQuestion.required,
            NameContent: selectingQuestion.name || selectingQuestion.type! + (questionsAdded.map(e => e.id).indexOf(selectingQuestion.id!) + 1),
            Placeholder: !!selectingQuestion.placeholder,
            PlaceholderContent: selectingQuestion.placeholder,
            Description: !!selectingQuestion.description,
            DescriptionContent: selectingQuestion.description,
            Long: selectingQuestion.type === DraggableFields.Text && selectingQuestion.long,
            DateRestriction: selectingQuestion.type === DraggableFields.Date && selectingQuestion.dateRestriction,
            Multiple: selectingQuestion.type === DraggableFields.Checkbox && selectingQuestion.multi

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

    const handleMultiChanges = (checked: boolean) => {
        let newSchema = {}
        const updatedQuestionsAdded = questionsAdded.map(q => {
            const question = q as CheckboxQuestion
            if (question.id === selectedQuestion!.id) {
                question.multi = checked
                question.defaultValue = false
                if (checked) {
                    question.defaultValue = []
                }
                if (propertiesForm.watch("Required")) {
                    newSchema = MakeFieldRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "MultiCheckbox" : undefined)
                } else {
                    newSchema = MakeFieldNotRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "MultiCheckbox" : undefined)
                }
                form.setValue(q.id, question.defaultValue)

            }
            return q
        })
        setValidationFormSchema({ ...validationFormSchema, ...newSchema })
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
        setQuestionsAdded(updatedQuestionsAdded)
    }, 500)

    const handleDeleteQuestion = useCallback((id: string) => {
        propertiesForm.reset()
        setSelectedQuestion(undefined)
        const newValidationFormSchema = { ...validationFormSchema }
        delete newValidationFormSchema[id]
        setValidationFormSchema(newValidationFormSchema)
        setQuestionsAdded(questionsAdded.filter(q => q.id !== id))



    }, [questionsAdded, propertiesForm, validationFormSchema])


    const handleOptionsUpdate = (id: string, options: Array<string>) => {
        const updatedQuestions = questionsAdded.map((q) => {
            if (q.id === id) {
                (q as RadioQuestion | CheckboxQuestion).items = [...options]
                return q
            }
            return q
        })
        setQuestionsAdded((updatedQuestions as Question[]))
    }

    const handleOptionUpdate = (optionId: number, content: string) => {
        const updatedQuestions = questionsAdded.map((q) => {
            if ((selectedQuestion?.type === DraggableFields.Radio || (selectedQuestion?.type === DraggableFields.Checkbox && selectedQuestion.multi)) && selectedQuestion.id === q.id) {
                const options = selectedQuestion.items
                const updatedOptions = options!.map((item: string, i: number) => {
                    if (optionId === i) {
                        item = content
                    }
                    return item
                })
                const radioQuestion = (q as RadioQuestion)
                radioQuestion.items = [...updatedOptions]
                return radioQuestion
            }
            return q
        })
        setQuestionsAdded((updatedQuestions as Question[]))
    }


    const handleSaveForm = useDebouncedCallback(async () => {
        const currentForm = {
            id: id!,
            name: formName!,
            title: formTitle,
            description: formDescription,
            questions: questionsAdded.map(q => ({
                ...q,
                name: q.name || q.type + (questionsAdded.map(e => e.id).indexOf(q.id) + 1),
                defaultValue: undefined
            })),
        }
        const saveResponse = await services.form.saveForm(currentForm) as Message
        if (saveResponse.statusCode === 200) {
            toast.success("Form saved")
        } else {
            toast.error(saveResponse.message)
        }
        setIsSaving(false)
    }, 500)

    return (
        <>
            {!isSubmitted && <DragDropContext
                onDragEnd={onDragEnd}
            >
                {!previewOn && <div className="w-full max-w-xs">

                    <Tabs defaultValue={ControlPanel.Fields} value={selectedQuestion ? ControlPanel.Properties : ControlPanel.Fields}>
                        <TabsList className="grid w-full grid-cols-2">

                            <TabsTrigger value={ControlPanel.Fields}>{ControlPanel.Fields}</TabsTrigger>
                            <TabsTrigger disabled={!selectedQuestion} value={ControlPanel.Properties}>{ControlPanel.Properties}</TabsTrigger>
                        </TabsList>
                        <TabsContent value={ControlPanel.Fields}>
                            <ControlsPanel fields={fieldsList} />
                        </TabsContent>
                        <TabsContent value={ControlPanel.Properties}>
                            <PropertiesPanel
                                propertiesRef={propertiesRef}
                                propertiesForm={propertiesForm}
                                selectedQuestion={selectedQuestion}
                                handlePropertyTextUpdate={handlePropertyTextUpdate}
                                handleRequiredChanges={handleRequiredChanges}
                                handleTextChanges={handleTextChanges}
                                handleDateRulesChanges={handleDateRulesChanges}
                                handleMultiChanges={handleMultiChanges}
                                handleDeleteQuestion={handleDeleteQuestion}
                            />
                        </TabsContent>
                    </Tabs>

                </div>}
                <div className="w-full max-w-screen-sm">
                    <div className="flex justify-between" >
                        <div className="flex items-center gap-2" >
                            {!submit && <FormNameEditor
                                defaultLabel={formName}
                                onUpdateContent={handleFormNameUpdate}
                                editable={previewOn}
                            />}

                            {!submit && <Button variant="outline" className="mb-2" onClick={handleSwitchMode} >
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
                            </Button>}
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
                                    {(provided) => (
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
                                                            onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                            popoverRef={popoverRef}
                                                            view={view}

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
                                                            onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                            popoverRef={popoverRef}
                                                            view={view}

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
                                                            onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                            popoverRef={popoverRef}
                                                            onOptionUpdate={handleOptionUpdate}
                                                            onOptionsUpdate={handleOptionsUpdate}
                                                            view={view}
                                                        />
                                                    }
                                                    {q.type === DraggableFields.Radio &&
                                                        <RadioField
                                                            {...q}
                                                            form={form.control}
                                                            index={i}
                                                            previewOn={previewOn}
                                                            selected={q.selected}
                                                            onUpdateLabelContent={handleLabelContentUpdate}
                                                            onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                            popoverRef={popoverRef}
                                                            onOptionUpdate={handleOptionUpdate}
                                                            onOptionsUpdate={handleOptionsUpdate}
                                                            view={view}
                                                        />
                                                    }
                                                    {q.type === DraggableFields.Signature && <SignatureField
                                                        {...q}
                                                        form={form.control}
                                                        index={i}
                                                        previewOn={previewOn}
                                                        selected={q.selected}
                                                        onUpdateLabelContent={handleLabelContentUpdate}
                                                        onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                        popoverRef={popoverRef}
                                                        view={view}
                                                    />}
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
                                            {!view && <Button type="submit" disabled={(!previewOn || isSubmiting || (previewOn && !form.formState.isValid))} >
                                                {isSubmiting && <Loader2Icon className="animate-spin" />}
                                                Submit
                                            </Button>}
                                        </form>
                                    )}
                                </Droppable>
                            </Form>
                        </CardContent>
                    </Card>
                    <Toaster position={(previewOn && !submit) ? "bottom-right" : "bottom-center"} />
                </div>
            </DragDropContext>}
            {isSubmitted &&
                <div className="mb-90 flex flex-col justify-center items-center gap-2">
                    <CircleCheck size={50} />
                    <h1 className="scroll-m-20 text-center text-2xl font-semibold tracking-tight text-balance">
                        Your response has been submitted!
                    </h1>
                </div>
            }
        </>
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
        selected: false,
        required: true,
        items: [],
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
export function MakeFieldRequired(fieldName: string, type: FieldTypes, subType?: FieldSubtypes) {
    let schema;
    switch (type) {
        case DraggableFields.Text:
            schema = z.string().min(1);
            break;
        case DraggableFields.Date:
            schema = z.date();
            break;
        case DraggableFields.Checkbox:
            schema = z.literal<boolean>(true, { errorMap: () => ({ message: "Required", }), })
            if (subType === "MultiCheckbox") {
                schema = z.array(z.number()).nonempty({
                    message: "You have to select at least one item.",
                })
            }
            break;
        case DraggableFields.Radio:
            schema = z.string().min(1,
                { message: "Select one option" }
            );
            break;
        case DraggableFields.Signature:
            schema = z.string().min(1, "Required");
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

export function MakeFieldNotRequired(fieldName: string, type: FieldTypes, subType?: FieldSubtypes) {
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
            if (subType === "MultiCheckbox") {
                schema = z.array(z.number()).optional()
            }
            break;
        case DraggableFields.Radio:
            schema = z.string().optional()
            break;
        case DraggableFields.Signature:
            schema = z.string().optional()
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}



