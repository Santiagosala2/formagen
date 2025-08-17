"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
import { ArrowLeft, Check, Edit, File, MoreHorizontal, Plus, Share, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { services } from "@/services";

import { redirect } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"
import { DialogProps } from "@radix-ui/react-dialog"
import { Loader2Icon } from "lucide-react"
import { ComponentProps, FC, useEffect, useMemo, useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
    Form as Formi,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormTableKeys, NewForm, SharedUser } from "./types";
import { captializeFirst, formatToAEST } from "@/utils/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { User } from "../usersTable/types";
import { TooltipWrapper } from "../ui/tooltip";


const columnHelper = createColumnHelper<Form>()

const generateColumns = (onDelete: (row: Row<Form>) => void, onShare: (row: Row<Form>) => void): ColumnDef<Form, any>[] => {
    const columns = [
        columnHelper.accessor(FormTableKeys.name, {
            header: props => captializeFirst(props.column.id)
        }),
        columnHelper.accessor(FormTableKeys.lastUpdated, {
            header: () => "Last Updated",
            cell: props => formatToAEST(props.getValue()!)
        }),
        columnHelper.accessor(FormTableKeys.created, {
            header: props => captializeFirst(props.column.id),
            cell: props => formatToAEST(props.getValue()!)
        }),
        columnHelper.display({
            id: FormTableKeys.actions,
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <TooltipWrapper name="Edit form">
                    <Button onClick={() => redirect(`/build/${(props.row).original.id}`)} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
                        <Edit />
                    </Button>
                </TooltipWrapper>
                <TooltipWrapper name="View responses">
                    <Button onClick={() => redirect(`/dashboard/forms/${(props.row).original.id}/view`)} className="text-lime-600 cursor-pointer hover:border-lime-600 hover:text-lime-600 hover:bg-transparent" variant="outline" size="icon">
                        <File />
                    </Button>
                </TooltipWrapper>
                <TooltipWrapper name="Share form">
                    <Button onClick={() => onShare(props.row)} className="text-cyan-600 cursor-pointer hover:border-cyan-600 hover:text-cyan-600 hover:bg-transparent" variant="outline" size="icon">
                        <Share />
                    </Button>
                </TooltipWrapper>
                <TooltipWrapper name="Delete form">
                    <Button onClick={() => onDelete(props.row)} className="text-destructive cursor-pointer hover:border-destructive hover:text-destructive hover:bg-transparent" variant="outline" size="icon">
                        <Trash />
                    </Button>
                </TooltipWrapper>
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
        const forms = await services.form.getAllForms();
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


export default function FormTableComponent({ defaultData, }: { defaultData: Form[], refreshData: () => void }) {
    const [data, _setData] = useState(() => [...defaultData])
    const [addFormDialogOpen, setAddFormDialogOpen] = useState(false)
    const [addingForm, setAddingForm] = useState<boolean>(false);
    const [errMsgAddingForm, setErrMsgAddingForm] = useState<string>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [manageAccessOpen, setManageAccessOpen] = useState(false)
    const [selectedForm, setSelectedForm] = useState<Form>()
    const [peoplePickerUsers, setPeoplePickerUsers] = useState<User[]>([])
    const [sharedUsers, setSharedUsers] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])

    const handleDeleteDialogOpen = (row: Row<Form>) => {
        setDeleteDialogOpen(true)
        setSelectedForm(row.original)
    }

    const handleShareDialogOpen = async (row: Row<Form>) => {
        setManageAccessOpen(false)
        setSharedUsers([])
        setSelectedUsers([])
        const allUsers = await services.user.getAllUsers();
        setPeoplePickerUsers(allUsers)
        setShareDialogOpen(true)
        setSelectedForm(row.original)

    }

    const handleDeleteForm = async () => {
        if (selectedForm) {
            const response = await services.form.deleteForm(selectedForm.id)
            if (response.statusCode === 200 || response.statusCode === 204) {
                setSelectedForm(undefined)
                setDeleteDialogOpen(false)
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
        const newForm = await services.form.createForm({
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


    // Share form logic
    const handleManageAccessOpen = async () => {
        let form = await services.form.getForm(selectedForm!.id)
        if ((form as Message).statusCode === 404) {
            return
        }
        form = form as Form;
        setSharedUsers(form.sharedUsers!);
        setManageAccessOpen(true)
    }

    const handleManageAccessClose = () => setManageAccessOpen(false)

    const handleSelectUsersToShare = (user: User) => {
        if (selectedUsers.includes(user)) {
            return setSelectedUsers(
                selectedUsers.filter(
                    (selectedUser) => selectedUser !== user
                )
            )
        }

        return setSelectedUsers(
            [...peoplePickerUsers].filter((u) =>
                [...selectedUsers, user].includes(u)
            )
        )
    }

    const handleShareAccess = async () => {
        const shareForm = await services.form.shareForm({ id: selectedForm!.id, users: selectedUsers as SharedUser[] });
        if (shareForm.statusCode === 200) {
            toast.success(`${selectedForm?.name} has been shared succesfully`);
            setShareDialogOpen(false)
        }
    }

    const handleRemoveAccess = async (userId: string) => {
        const removeAccess = await services.form.removeAccessForm({ id: selectedForm!.id, userId: userId });
        if (removeAccess.statusCode === 200) {
            toast.success(`Access has been removed successfully on ${selectedForm?.name}`);
            setShareDialogOpen(false)
        }
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
                open={deleteDialogOpen}
                onDelete={handleDeleteForm}
                onCancel={() => setDeleteDialogOpen(false)}
            />
            <ShareFormDialog
                open={shareDialogOpen}
                manageAccessOpen={manageAccessOpen}
                onOpenChange={(open) => setShareDialogOpen(open)}
                selectedForm={selectedForm!}
                peoplePickerUsers={peoplePickerUsers}
                selectedUsers={selectedUsers}
                sharedUsers={sharedUsers}
                onSelectUsersToShare={handleSelectUsersToShare}
                onShareManageAccess={handleShareAccess}
                onOpenManageAccess={handleManageAccessOpen}
                onCloseManageAccess={handleManageAccessClose}
                onRemoveAccess={handleRemoveAccess}
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

function ShareFormDialog({ ...props }: ComponentProps<FC<DialogProps>> & {
    onSubmit?: (input: string) => void
    buttonDisabled?: boolean
    errMessage?: string | undefined
    peoplePickerUsers: User[]
    selectedForm: Form
    selectedUsers: User[]
    sharedUsers: User[]
    manageAccessOpen: boolean
    onOpenManageAccess: () => void
    onCloseManageAccess: () => void
    onShareManageAccess: () => void
    onSelectUsersToShare: (user: User) => void
    onRemoveAccess: (userId: string) => void


}) {
    const {
        open,
        defaultOpen,
        manageAccessOpen,
        onOpenChange,
        onOpenManageAccess,
        onShareManageAccess,
        onSelectUsersToShare,
        onCloseManageAccess,
        onRemoveAccess,
        peoplePickerUsers,
        selectedUsers,
        sharedUsers,
        selectedForm,
    } = props


    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {!manageAccessOpen && <DialogTitle>{`Share ${selectedForm ? selectedForm.name : ""} form`}</DialogTitle>}
                    {manageAccessOpen &&
                        <DialogTitle>
                            <Button className="mr-2" onClick={onCloseManageAccess} size="icon" variant="outline" >
                                <ArrowLeft />
                            </Button>
                            Manage access
                        </DialogTitle>
                    }
                </DialogHeader>
                {!manageAccessOpen && <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="p-2">
                            {peoplePickerUsers.map((user) => (
                                <CommandItem
                                    key={user.email}
                                    className="flex items-center px-2"
                                    onSelect={() => onSelectUsersToShare(user)}
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
                {manageAccessOpen && <div className="space-y-4">
                    <div className="text-sm font-medium">People with access</div>
                    <div className="grid gap-6">
                        {sharedUsers.map(p => (
                            <div key={p.id} className="flex items-center justify-between space-x-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarFallback>{p.name[0].toLocaleUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {p.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{p.email}</p>
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
                                        <DropdownMenuItem onClick={() => onRemoveAccess(p.id!)} >Remvove access</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                        {sharedUsers.length === 0 && <p className="text-sm"> Form has not been shared yet</p>}
                    </div>
                </div>}
                {!manageAccessOpen && <DialogFooter className="flex items-center border-t p-4 sm:justify-between">

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
                        disabled={selectedUsers.length < 1}
                        onClick={onShareManageAccess}
                    >
                        Share
                    </Button>

                </DialogFooter>}
                {!manageAccessOpen && <Button onClick={onOpenManageAccess} variant="outline">Manage access</Button>}

            </DialogContent>
        </Dialog>
    )
}

