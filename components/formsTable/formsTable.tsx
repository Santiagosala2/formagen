"use client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from '@tanstack/react-table'
import { Message, Form, FormTableKeys, NewForm } from "./types";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import services from "@/services/form";
import { redirect } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogProps } from "@radix-ui/react-dialog"
import { Loader2Icon } from "lucide-react"
import { ComponentProps, FC, ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
    Form as Formi,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


const columnHelper = createColumnHelper<Form>()

const captializeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const formatToAEST = (date: Date) => format(date, "dd/MM/yyyy")
const generateColumns = (onDelete: (row: Row<Form>) => void): ColumnDef<Form, any>[] => {
    const columns = [
        columnHelper.accessor(FormTableKeys.name, {
            header: props => captializeFirst(props.column.id)
        }),
        columnHelper.accessor(FormTableKeys.lastUpdated, {
            header: props => "Last Updated",
            cell: props => formatToAEST(props.getValue())
        }),
        columnHelper.accessor(FormTableKeys.created, {
            header: props => captializeFirst(props.column.id),
            cell: props => formatToAEST(props.getValue())
        }),
        columnHelper.display({
            id: FormTableKeys.actions,
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <Button onClick={() => redirect(`/build/${(props.row).original.id}`)} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
                    <Edit />
                </Button>
                <Button onClick={() => onDelete(props.row)} className="text-destructive cursor-pointer hover:border-destructive hover:text-destructive hover:bg-transparent" variant="outline" size="icon">
                    <Trash />
                </Button>
            </div>

        }),

    ]
    return columns
}

export function SetFormTable() {
    const [forms, setForms] = useState<Form[]>()
    const [fetching, setFetching] = useState<boolean>()

    const getAllForms = async () => {
        setFetching(true)
        const forms = await services.getAllForms();
        setForms(forms)
        console.log(forms)
        setFetching(false)
    }

    useEffect(() => {
        getAllForms()
    }, [])

    return (
        <>
            {fetching === false && <FormTableComponent defaultData={forms ?? []} refreshData={getAllForms} />}

        </>

    )
}


export default function FormTableComponent({ defaultData, refreshData }: { defaultData: Form[], refreshData: () => void }) {
    const [data, _setData] = useState(() => [...defaultData])
    const rerender = useReducer(() => ({}), {})[1]
    const [addFormDialogOpen, setAddFormDialogOpen] = useState(false)
    const [addingForm, setAddingForm] = useState<boolean>(false);
    const [errMsgAddingForm, setErrMsgAddingForm] = useState<string>()
    const [deleteFormDialogOpen, setDeleteFormDialogOpen] = useState(false)
    const [selectedForm, setSelectedForm] = useState<Form>()

    const handleDeleteDialogOpen = (row: Row<Form>) => {
        setDeleteFormDialogOpen(true)
        setSelectedForm(row.original)
    }


    const handleDeleteForm = async () => {
        if (selectedForm) {
            const response = await services.deleteForm(selectedForm.id)
            if (response.statusCode === 200 || response.statusCode === 204) {
                setSelectedForm(undefined)
                setDeleteFormDialogOpen(false)
                _setData(data.filter((d) => d.id !== selectedForm.id))
                toast.success("Form deleted")
            }

        }



    }

    const columns = useMemo(() => generateColumns(handleDeleteDialogOpen), [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAddForm = async (input: string) => {
        setErrMsgAddingForm("")
        setAddingForm(true)
        const newForm = await services.createForm({
            name: input
        })

        const errMsg = newForm as Message
        if (errMsg.statusCode !== 400) {
            redirect(`/build/${(newForm as NewForm).id}`)
        }
        setErrMsgAddingForm(errMsg.message)
        setAddingForm(false)
    }

    const handleAddFormDialogOpen = (open: boolean) => {
        setErrMsgAddingForm("")
        setAddFormDialogOpen(open)
    }



    return (
        <>
            <AddFormDialog
                open={addFormDialogOpen}
                onOpenChange={handleAddFormDialogOpen}
                onSubmit={handleAddForm}
                buttonDisabled={addingForm}
                errMessage={errMsgAddingForm}
            />
            <DeleteFormDialog
                open={deleteFormDialogOpen}
                onDelete={handleDeleteForm}
                onCancel={() => setDeleteFormDialogOpen(false)}


            />
            <div className="w-full mt-10 flex flex-col">
                <div className="m-2 flex flex-col">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        All forms
                    </h3>
                    <div className="self-end">
                        <Button onClick={() => setAddFormDialogOpen(true)} ><Plus />Add form</Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Toaster position="bottom-center" />
            </div>
        </>
    )
}

const AddFormSchema = z.object({
    name: z.string().min(3, {
        message: "Form name must be at least 3 characters.",
    }),
})


function AddFormDialog({ onSubmit, buttonDisabled, errMessage, ...props }: ComponentProps<FC<DialogProps>> & {
    onSubmit: (input: string) => void
    buttonDisabled?: boolean
    errMessage: string | undefined

}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { open, defaultOpen, onOpenChange } = props

    const form = useForm<z.infer<typeof AddFormSchema>>({
        resolver: zodResolver(AddFormSchema),
        defaultValues: {
            name: "",
        },
    })


    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add form</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Formi {...form}>
                    <form onSubmit={form.handleSubmit(({ name }) => onSubmit(name))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="form's name" {...field} />

                                    </FormControl>
                                    <FormMessage />
                                    {errMessage &&
                                        <p className="text-destructive text-sm">
                                            {errMessage}
                                        </p>}
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={!!buttonDisabled} >
                                {buttonDisabled && <Loader2Icon className="animate-spin" />}
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                </Formi>
            </DialogContent>
        </Dialog>
    )
}

function DeleteFormDialog({ onDelete, onCancel, ...props }: ComponentProps<typeof AlertDialogPrimitive.Root> & {
    onDelete: () => void,
    onCancel: () => void

}) {

    const { open, defaultOpen, onOpenChange } = props

    return (
        <AlertDialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete form</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        form
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} >Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} variant={"destructive"}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
