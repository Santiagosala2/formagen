"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "../form"
import TextField from "../textField/textField"
import { Button } from "../button"
import { Card, CardContent } from "../card"
import { ReactNode } from "react"
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd"
import { atom, createStore, Provider, useAtom } from "jotai"
import { Blocks, Eye, View } from "lucide-react"

const formSchema = z.object({
    username: z.string().min(2).max(50),
})


const fieldsListTest = [
    {

        name: 'username',
        label: "Question1",
        placeholder: "placeholder q1",
        description: "",
    },
    {
        name: 'firstname',
        label: "Question2",
        placeholder: "placeholder q2",
        description: "",
    },
    {
        name: 'lastname',
        label: "Question3",
        placeholder: "placeholder q3",
        description: "d",

    },
]

const store = createStore()

const fieldsAtom = atom(fieldsListTest);
const previewOnAtom = atom(false);




export function FormBuilder() {
    const [fields, setFields] = useAtom(fieldsAtom)
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

        const newFields = [...fields];
        const getField = newFields.filter(n => n.name === draggableId)[0]
        newFields.splice(source.index, 1);
        newFields.splice(destination.index, 0, getField)
        setFields(newFields)

    }

    function onSwitchMode() {
        setPreviewOn(!previewOn)
    }

    return (
        <>
            <Provider store={store}>
                {!previewOn && <div className="w-full max-w-xs">
                    <Card className="flex-row flex-wrap gap-x-3 gap-y-6 px-6">
                        <SelectBlock>Multil Text</SelectBlock>
                        <SelectBlock>Multil Text</SelectBlock>
                        <SelectBlock>Multil Text</SelectBlock>
                        <SelectBlock>Multil Text</SelectBlock>
                        <SelectBlock>Multil Text</SelectBlock>
                        <SelectBlock>Multil Text</SelectBlock>
                    </Card>
                </div>}
                <div className="w-full max-w-screen-sm">
                    <Button variant="outline" className="mb-2" onClick={onSwitchMode} >
                        {!previewOn && <Eye />}{!previewOn && "Preview"}
                        {previewOn && <Blocks />}{previewOn && "Builder"}
                    </Button>
                    <DragDropContext
                        onDragEnd={onDragEnd}
                    >
                        <Card>
                            <CardContent>
                                <Form {...form}>
                                    <Droppable
                                        droppableId={"1"}
                                        isDropDisabled={previewOn}
                                    >
                                        {provided => (
                                            <form
                                                onSubmit={form.handleSubmit(onSubmit)}
                                                className="space-y-8"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {fields.map((f, i) => (
                                                    <TextField
                                                        key={f.name}
                                                        form={form.control}
                                                        name={f.name}
                                                        label={f.label}
                                                        placeholder={f.placeholder}
                                                        description={f.description}
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
                    </DragDropContext>
                </div>
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