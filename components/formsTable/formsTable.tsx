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
import { Message } from "@/services/common";
import { Button } from "../ui/button";
import { ArrowLeft, Check, Edit, MoreHorizontal, Plus, Share, Trash } from "lucide-react";
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
import { Form, FormTableKeys, NewForm } from "./types";
import { captializeFirst, formatToAEST } from "@/utils/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";


const columnHelper = createColumnHelper<Form>()

const generateColumns = (onDelete: (row: Row<Form>) => void, onShare: (row: Row<Form>) => void): ColumnDef<Form, any>[] => {
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
                <Button onClick={() => onShare(props.row)} className="text-cyan-600 cursor-pointer hover:border-cyan-600 hover:text-cyan-600 hover:bg-transparent" variant="outline" size="icon">
                    <Share />
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
    const [shareFormDialogOpen, setShareFormDialogOpen] = useState(false)
    const [selectedForm, setSelectedForm] = useState<Form>()

    const handleDeleteDialogOpen = (row: Row<Form>) => {
        setDeleteFormDialogOpen(true)
        setSelectedForm(row.original)
    }

    const handleShareDialogOpen = (row: Row<Form>) => {
        setShareFormDialogOpen(true)
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

    const columns = useMemo(() => generateColumns(handleDeleteDialogOpen, handleShareDialogOpen), [])

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
            <ShareFormDialog
                open={shareFormDialogOpen}
                onOpenChange={(open) => setShareFormDialogOpen(open)}
            />

            <div className="w-full mt-10 flex flex-col">
                <div className="m-2 flex flex-col">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        All Forms
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

const users = [
    {
        name: "Olivia Martin",
        email: "m@example.com"
    },
    {
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com"
    },
    {
        name: "Emma Wilson",
        email: "emma@example.com"
    },
    {
        name: "Jackson Lee",
        email: "lee@example.com",
    },
    {
        name: "William Kim",
        email: "will@email.com"
    },
]

function ShareFormDialog({ onSubmit, buttonDisabled, errMessage, ...props }: ComponentProps<FC<DialogProps>> & {
    onSubmit?: (input: string) => void
    buttonDisabled?: boolean
    errMessage?: string | undefined

}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { open, defaultOpen, onOpenChange } = props
    const [selectedUsers, setSelectedUsers] = useState<Array<any>>([])
    const [manageAccesOpen, setManageAccessOpen] = useState<boolean>(false)

    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {!manageAccesOpen && <DialogTitle>Share "X" form</DialogTitle>}
                    {manageAccesOpen &&
                        <DialogTitle>
                            <Button className="mr-2" onClick={() => { setManageAccessOpen(false) }} size="icon" variant="outline" >
                                <ArrowLeft />
                            </Button>
                            Manage access
                        </DialogTitle>
                    }
                </DialogHeader>
                {!manageAccesOpen && <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="p-2">
                            {users.map((user) => (
                                <CommandItem
                                    key={user.email}
                                    className="flex items-center px-2"
                                    onSelect={() => {
                                        if (selectedUsers.includes(user)) {
                                            return setSelectedUsers(
                                                selectedUsers.filter(
                                                    (selectedUser) => selectedUser !== user
                                                )
                                            )
                                        }

                                        return setSelectedUsers(
                                            [...users].filter((u) =>
                                                [...selectedUsers, user].includes(u)
                                            )
                                        )
                                    }}
                                >
                                    <Avatar>
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-2">
                                        <p className="text-sm font-medium leading-none">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    {selectedUsers.includes(user) ? (
                                        <Check className="ml-auto flex h-5 w-5 text-primary" />
                                    ) : null}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>}
                {manageAccesOpen && <div className="space-y-4">
                    <div className="text-sm font-medium">People with access</div>
                    <div className="grid gap-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>OM</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        Olivia Martin
                                    </p>
                                    <p className="text-sm text-muted-foreground">m@example.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>IN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        Isabella Nguyen
                                    </p>
                                    <p className="text-sm text-muted-foreground">b@example.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>SD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        Sofia Davis
                                    </p>
                                    <p className="text-sm text-muted-foreground">p@example.com</p>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Remvove access</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>}
                {!manageAccesOpen && <DialogFooter className="flex items-center border-t p-4 sm:justify-between">

                    {selectedUsers.length > 0 ? (
                        <div className="flex -space-x-2 overflow-hidden">
                            {selectedUsers.map((user) => (
                                <Avatar
                                    key={user.email}
                                    className="inline-block border-2 border-background"
                                >
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Select users to share.
                        </p>
                    )}

                    <Button
                        disabled={selectedUsers.length < 2}
                        onClick={() => {

                        }}
                    >
                        Share
                    </Button>

                </DialogFooter>}
                {!manageAccesOpen && <Button onClick={() => setManageAccessOpen(true)} variant="outline">Manage access</Button>}

            </DialogContent>
        </Dialog>
    )
}
