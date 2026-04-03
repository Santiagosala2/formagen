"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, } from "react-hook-form"
import { z, } from "zod"
import { Form, } from "../ui/form"
import TextField from "../fields/textField"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { ReactNode, useCallback, useState } from "react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import { Blocks, Calendar, Check, ChevronsUpDown, CircleDotIcon, Eye, GithubIcon, Hash, LetterText, Loader2Icon, Save, SignatureIcon } from "lucide-react"
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
    NumberQuestion,
    ComboboxQuestion,
    FieldSubtypes,
    ChoiceItem,
    FormBuilderProps,
    FormBuilderMode,
    Step,
    StepQuestionId,

} from "./types"
import { DateField } from "../fields/dateField"
import React from "react"
import { Toaster } from "../ui/sonner"
import { toast } from "sonner"
import FormTitleEditor from "../editors/formTitleEditor"
import DescriptionEditor from "../editors/descriptionEditor"
import { CheckboxField } from "../fields/checkboxField"
import FormNameEditor from "../editors/formNameEditor"
import RadioField from "../fields/radioField"
import { PropertiesPanel } from "./propertiesPanel"
import { FieldControlsPanel } from "./fieldControlsPanel"
import { StepsControlsPanel } from "./stepsControlsPanel"
import SignatureField from "../fields/signatureField"
import NumberField from "../fields/numberField"
import ComboboxField from "../fields/comboboxField"
import { StepContainer } from "../steps/stepContainer"


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
    },
    {
        name: DraggableFields.Number,
        displayName: 'Number',
        icon: Hash
    },
    {
        name: DraggableFields.Combobox,
        displayName: 'Combobox',
        icon: ChevronsUpDown
    }

]

const steps: Step[] = []


export function FormBuilder({
    id,
    name,
    title,
    description,
    questions,
    initialValues,
    validationSchema,
    submitHandler,
    saveHandler,
    mode
}: FormBuilderProps) {

    const [formName, setFormName] = useState(name)
    const [formTitle, setFormTitle] = useState(title)
    const [formDescription, setFormDecription] = useState(description)

    const [questionsAdded, setQuestionsAdded] = useState<Question[]>(questions)
    const [selectedQuestion, setSelectedQuestion] = useState<Question>();

    const [stepsAdded, setStepsAdded] = useState<Step[]>(steps);
    const [selectedStep, setSelectedStep] = useState<Step>()
    const [stepsEnabled, setStepsEnabled] = useState(false);
    const [selectedTab, setSelectedTab] = useState<ControlPanel>(ControlPanel.Fields);

    const [previewOn, setPreviewOn] = useState((mode === FormBuilderMode.Submission || mode === FormBuilderMode.View));
    const [validationFormSchema, setValidationFormSchema] = useState(validationSchema);
    const [defaultValues] = useState(initialValues);


    const [isSaving, setIsSaving] = useState(false);
    const [isSubmiting, setIsSubmitting] = useState(false);


    const form = useForm({
        resolver: UpdateResolver(validationFormSchema),
        defaultValues: defaultValues,
    })


    const getQuestionsAddedIds = () => {
        return questionsAdded.map(q => q.id);
    }


    const onAddSteps = (): Step => {
        const stepsAddedCopy = stepsAdded.map(s => {
            return { ...s, selected: false }
        })
        const stepToAdd = {
            id: uuid(),
            orderIndex: stepsAddedCopy.length + 1,
            description: "",
            title: "New Steps",
            questionsIds: [],
            selected: true
        }
        stepsAddedCopy.push(stepToAdd)
        setStepsAdded(stepsAddedCopy);
        setSelectedStep({ ...stepToAdd });
        setSelectedQuestion(undefined)
        return { ...stepToAdd }

    }

    const onSelectSteps = (selectedStepId: string) => {
        let tempSelectedStep: Step | undefined = undefined;
        const stepsAddedCopy = stepsAdded.map(s => {
            if (s.id === selectedStepId) {
                s.selected = true
                tempSelectedStep = s;
            } else {
                s.selected = false;
            }
            return s;
        })
        setSelectedStep(tempSelectedStep);
        setStepsAdded(stepsAddedCopy);
    }

    const onEnableSteps = () => {
        const tempSelectedStep = onAddSteps();
        setStepsEnabled(true);
        if (questionsAdded.length > 0) {
            tempSelectedStep.questionsIds = getQuestionsAddedIds();
            const stepsAddedCopy = [{ ...tempSelectedStep }];
            setSelectedStep(tempSelectedStep);
            setStepsAdded(stepsAddedCopy);
        }
    }

    const onDisableSteps = () => {
        setStepsAdded([]);
        setSelectedStep(undefined);
        setStepsEnabled(false);
    }



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
        if (mode === FormBuilderMode.Designer) {
            toast((<SubmitToastBlock>{JSON.stringify(submitObj, null, 2)}</SubmitToastBlock>))
            return
        }
        if (mode === FormBuilderMode.Submission && submitHandler) {
            setIsSubmitting(true);
            await submitHandler(questionsResponse);
            setIsSubmitting(false);
        }
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

                if (stepsEnabled) {
                    const tempSelectedStep = { ...selectedStep! };
                    const tempQuestionsIds = CloneArray(tempSelectedStep.questionsIds)
                    tempQuestionsIds.splice(destination.index, 0, newQuestion.id);
                    tempSelectedStep.questionsIds = tempQuestionsIds;
                    const tempStepsAdded = stepsAdded.map(s => {
                        if (s.id === tempSelectedStep.id) {
                            return { ...s, questionsIds: tempQuestionsIds }
                        }
                        return s
                    });

                    setSelectedStep(tempSelectedStep)
                    setStepsAdded(tempStepsAdded);
                    questionsAddedCopy.push(newQuestion);

                } else {
                    questionsAddedCopy.splice(destination.index, 0, newQuestion);
                }
                setQuestionsAdded(questionsAddedCopy);
                const requiredSchema = MakeFieldRequired(newQuestion.id, newQuestion.type);
                setValidationFormSchema({ ...validationFormSchema, ...requiredSchema });

                break;
            case Droppables.Steps:
                setStepsAdded(
                    MoveSteps(
                        draggableId,
                        destination.index,
                        source.index,
                        stepsAdded
                    )
                )
                break;

            default:
                // Move already added questions around

                if (stepsEnabled) {
                    const tempSelectedStep = { ...selectedStep! };
                    const tempQuestionsIds = MoveQuestion<StepQuestionId>(
                        destination.index,
                        source.index,
                        tempSelectedStep.questionsIds,
                        (n) => n === draggableId
                    );

                    tempSelectedStep.questionsIds = tempQuestionsIds;
                    const tempStepsAdded = stepsAdded.map(s => {
                        if (s.id === tempSelectedStep.id) {
                            return { ...s, questionsIds: tempQuestionsIds }
                        }
                        return s
                    });
                    setSelectedStep(tempSelectedStep)
                    setStepsAdded(tempStepsAdded);
                } else {
                    const tempQuestionsAdded = MoveQuestion<Question>(
                        destination.index,
                        source.index,
                        questionsAdded,
                        (n) => n.id === draggableId
                    )
                    setQuestionsAdded(tempQuestionsAdded)

                }



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
        setSelectedTab(ControlPanel.Fields)
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
            q.defaultValue = undefined
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
            Multiple: (selectingQuestion.type === DraggableFields.Checkbox && selectingQuestion.multi) ||
                (selectingQuestion.type === DraggableFields.Combobox && (selectingQuestion as ComboboxQuestion).multi) || false,

        })


        setSelectedQuestion(selectingQuestion)
        setSelectedTab(ControlPanel.Properties)
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
            setQuestionsAdded(questionsAdded.map(q => {
                return { ...q, defaultValue: undefined }
            }))


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
            if (q.id !== selectedQuestion!.id) return q

            if (selectedQuestion!.type === DraggableFields.Combobox) {
                const question = q as ComboboxQuestion
                question.multi = checked
                question.defaultValue = checked ? [] : ''

                if (checked) {
                    question.items = []
                }

                if (propertiesForm.watch("Required")) {
                    newSchema = MakeFieldRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "Multiple" : undefined)
                } else {
                    newSchema = MakeFieldNotRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "Multiple" : undefined)
                }
                form.setValue(q.id, question.defaultValue)
            } else {
                const question = q as CheckboxQuestion
                question.multi = checked
                question.defaultValue = false
                if (checked) {
                    question.defaultValue = []
                }
                if (propertiesForm.watch("Required")) {
                    newSchema = MakeFieldRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "Multiple" : undefined)
                } else {
                    newSchema = MakeFieldNotRequired(selectedQuestion!.id, selectedQuestion!.type, checked ? "Multiple" : undefined)
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

    const handleNumberPropertiesChanges = (property: "min" | "max" | "step" | "allowDecimals", value: number | boolean | undefined) => {
        const updatedQuestionsAdded = questionsAdded.map(q => {
            const question = q as NumberQuestion
            if (question.id === selectedQuestion!.id) {
                if (property === "allowDecimals") {
                    question.allowDecimals = value as boolean
                } else {
                    question[property] = value as number | undefined
                }
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
        setSelectedTab(ControlPanel.Fields)
        const newValidationFormSchema = { ...validationFormSchema }
        delete newValidationFormSchema[id]
        setValidationFormSchema(newValidationFormSchema)
        const tempQuestionsAdded = questionsAdded.filter(q => q.id !== id)
        setQuestionsAdded(tempQuestionsAdded);

        if (stepsEnabled) {
            const tempSelectedStep = { ...selectedStep! }
            tempSelectedStep.questionsIds = tempSelectedStep.questionsIds.filter(q => q !== id);
            setSelectedStep(tempSelectedStep)

        }


    }, [questionsAdded, propertiesForm, validationFormSchema, selectedStep])


    const handleOptionsUpdate = (id: string, options: Array<ChoiceItem>) => {
        const updatedQuestions = questionsAdded.map((q) => {
            if (q.id === id) {
                (q as RadioQuestion | CheckboxQuestion).items = [...options]
                return q
            }
            return q
        })
        setQuestionsAdded((updatedQuestions as Question[]))
    }

    const handleOptionUpdate = (optionId: string, content: string) => {
        const updatedQuestions = questionsAdded.map((q) => {
            if ((selectedQuestion?.type === DraggableFields.Radio || (selectedQuestion?.type === DraggableFields.Checkbox && selectedQuestion.multi) || selectedQuestion?.type === DraggableFields.Combobox) && selectedQuestion.id === q.id) {
                const options = selectedQuestion.items
                const updatedOptions = options!.map((item: ChoiceItem) => {
                    if (optionId === item.id) {
                        item.item = content
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
        let isSavedSuccessful = false
        let errorMessage = null;
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

        if (mode === FormBuilderMode.Designer) {
            try {
                await saveHandler(currentForm);
                isSavedSuccessful = true;
            } catch (error) {
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else {
                    errorMessage = "Something went wrong";
                }

            }
        }

        if (isSavedSuccessful) {
            toast.success("Form saved")
        } else {
            toast.error(errorMessage)
        }

        setIsSaving(false)
    }, 500)



    return (
        <>
            <DragDropContext
                onDragEnd={onDragEnd}
            >
                {!previewOn && <div className="w-full max-w-xs">

                    <Tabs value={selectedQuestion ? ControlPanel.Properties : selectedTab} onValueChange={(v) => setSelectedTab(v as ControlPanel)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value={ControlPanel.Steps}>{ControlPanel.Steps}</TabsTrigger>
                            <TabsTrigger value={ControlPanel.Fields}>{ControlPanel.Fields}</TabsTrigger>
                            <TabsTrigger disabled={!selectedQuestion} value={ControlPanel.Properties}>{ControlPanel.Properties}</TabsTrigger>
                        </TabsList>
                        <TabsContent value={ControlPanel.Steps}>
                            <StepsControlsPanel
                                stepsEnabled={stepsEnabled}
                                onEnableSteps={onEnableSteps}
                                onDisableSteps={onDisableSteps}
                            />
                        </TabsContent>
                        <TabsContent value={ControlPanel.Fields}>
                            <FieldControlsPanel fields={fieldsList} />
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
                                handleNumberPropertiesChanges={handleNumberPropertiesChanges}
                                handleDeleteQuestion={handleDeleteQuestion}
                            />
                        </TabsContent>
                    </Tabs>

                </div>}
                <div className="w-full max-w-screen-sm">
                    <div className="flex justify-between" >
                        <div className="flex items-center gap-2" >
                            {mode === FormBuilderMode.Designer && <FormNameEditor
                                defaultLabel={formName}
                                onUpdateContent={handleFormNameUpdate}
                                editable={previewOn}
                            />}

                            {mode === FormBuilderMode.Designer && <Button variant="outline" className="mb-2" onClick={handleSwitchMode} >
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


                    {stepsEnabled &&
                        <Card className={"border-b-1 shadow-none p-3 mb-4"}>
                            <CardContent className="p-0">
                                <Droppable
                                    droppableId={Droppables.Steps}
                                    isDropDisabled={previewOn}
                                    direction="horizontal"

                                >
                                    {(provided, stepsSnapshot) => (
                                        <div
                                            className="grid grid-cols-5 grid-rows-5 place-items-center gap-y-0"
                                            style={{ gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr" }}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >

                                            {stepsAdded.sort(s => s.orderIndex).map((s, i) => (
                                                <React.Fragment key={s.id} >
                                                    <Draggable draggableId={s.id} index={i} isDragDisabled={previewOn} >
                                                        {(provided, snapshot) => (
                                                            <>
                                                                <div
                                                                    className="row-span-5 w-full"
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <StepContainer
                                                                        previewOn={previewOn}
                                                                        isActive={s.selected}
                                                                        state="Completed"
                                                                        title={s.title}
                                                                        description="dd"
                                                                        onStep={() => onSelectSteps(s.id)}
                                                                        lastAllowed={i + 1 === 5}

                                                                    />

                                                                </div>
                                                                <div className="row-span-5 relative h-full">
                                                                    {!stepsSnapshot.isDraggingOver &&
                                                                        (i === stepsAdded.length - 1) &&
                                                                        (stepsAdded.length < 5) &&
                                                                        !previewOn &&
                                                                        <Button onClick={onAddSteps} size="xs" variant={"outline"} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-4xl text-xs flex items-center justify-center z-10">
                                                                            +
                                                                        </Button>}
                                                                </div>
                                                            </>

                                                        )}
                                                    </Draggable>
                                                </React.Fragment>

                                            ))}

                                        </div>

                                    )}

                                </Droppable>
                            </CardContent>
                        </Card>


                    }



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
                                            {
                                                (stepsEnabled ?
                                                    selectedStep!.questionsIds.map(t => questionsAdded.find(q => q.id === t)!)
                                                    :
                                                    questionsAdded)

                                                    .map((q, i) => (

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
                                                                    view={mode === FormBuilderMode.View}

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
                                                                    view={mode === FormBuilderMode.View}

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
                                                                    view={mode === FormBuilderMode.View}
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
                                                                    view={mode === FormBuilderMode.View}
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
                                                                view={mode === FormBuilderMode.View}
                                                            />}
                                                            {q.type === DraggableFields.Number && <NumberField
                                                                {...q}
                                                                form={form.control}
                                                                index={i}
                                                                previewOn={previewOn}
                                                                selected={q.selected}
                                                                onUpdateLabelContent={handleLabelContentUpdate}
                                                                onSelectQuestion={() => handleSelectQuestion(q.id)}
                                                                popoverRef={popoverRef}
                                                                view={mode === FormBuilderMode.View}
                                                            />}
                                                            {q.type === DraggableFields.Combobox && <ComboboxField
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
                                                                view={mode === FormBuilderMode.View}
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
                                            {(mode === FormBuilderMode.Submission || mode === FormBuilderMode.Designer) && <Button type="submit" disabled={(!previewOn || isSubmiting)} >
                                                {isSubmiting && <Loader2Icon className="animate-spin" />}
                                                Submit
                                            </Button>}
                                        </form>
                                    )}
                                </Droppable>
                            </Form>
                        </CardContent>
                    </Card>
                    <Toaster position={(previewOn && mode === FormBuilderMode.Designer) ? "bottom-right" : "bottom-center"} />
                </div>
            </DragDropContext>

            {mode === FormBuilderMode.Designer && !previewOn && <Button onClick={() => window.open("https://github.com/Santiagosala2/formagen", '_blank')} ><GithubIcon className="self-end" /></Button>}

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
    newQuestion.label = DraggableFields[draggableId]

    return newQuestion
}

function MoveQuestion<T>(destinationIndex: number, sourceIndex: number, questionsAdded: T[], filterCallBack: (e: T) => boolean): T[] {

    // Move already added questions around
    const questionsAddedCopy = CloneArray(questionsAdded);
    const getQuestion = questionsAddedCopy.filter(filterCallBack)[0]
    questionsAddedCopy.splice(sourceIndex, 1);
    questionsAddedCopy.splice(destinationIndex, 0, getQuestion)
    return questionsAddedCopy
}

function MoveSteps(draggableId: string, destinationIndex: number, sourceIndex: number, stepsAdded: Array<any>) {

    // Move already added steps around
    const stepsAddedCopy = CloneArray(stepsAdded);
    const getSteps = stepsAddedCopy.filter(n => n.id === draggableId)[0]
    stepsAddedCopy.splice(sourceIndex, 1);
    stepsAddedCopy.splice(destinationIndex, 0, getSteps)
    return stepsAddedCopy
}


function CloneArray(typeAdded: Question[] | Array<any>) {
    return [...typeAdded]
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
            if (subType === "Multiple") {
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
        case DraggableFields.Number:
            schema = z.number({ message: "Required" });
            break;
        case DraggableFields.Combobox:
            schema = z.string().min(1, { message: "Select an option" });
            if (subType === "Multiple") {
                schema = z.array(z.string()).nonempty({ message: "Select at least one option" });
            }
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
            if (subType === "Multiple") {
                schema = z.array(z.number()).optional()
            }
            break;
        case DraggableFields.Radio:
            schema = z.string().optional()
            break;
        case DraggableFields.Signature:
            schema = z.string().optional()
            break;
        case DraggableFields.Number:
            schema = z.number().optional()
            break;
        case DraggableFields.Combobox:
            schema = z.string().optional();
            if (subType === "Multiple") {
                schema = z.array(z.string()).optional();
            }
            break;
        default:
            break;
    }
    return { [fieldName]: schema }
}

function UpdateResolver(schema: any) {
    return zodResolver(z.object(schema))
}



