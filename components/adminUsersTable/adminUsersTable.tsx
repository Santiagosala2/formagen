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
import { AdminUser, AdminUserTableKeys } from "./types";
import { Button } from "../ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import { Input } from "../ui/input";
import services from "@/services/admin";
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
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { captializeFirst } from "@/utils/utils";
import { Message } from "@/services/common";


const columnHelper = createColumnHelper<AdminUser>()

const generateColumns = (onDelete: (row: Row<AdminUser>) => void): ColumnDef<AdminUser, any>[] => {
    const columns = [
        columnHelper.accessor(AdminUserTableKeys.name, {
            header: props => captializeFirst(props.column.id)
        }),
        columnHelper.accessor(AdminUserTableKeys.email, {
            header: props => captializeFirst(props.column.id),
            cell: props => props.getValue().toLowerCase()
        }),
        columnHelper.display({
            id: AdminUserTableKeys.actions,
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <Button onClick={() => { }}>
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

export function SetAdminUsersTable() {
    const [users, setUsers] = useState<AdminUser[]>()
    const [fetching, setFetching] = useState<boolean>()

    const getAllUsers = async () => {
        setFetching(true)
        //const allUsers = await services.getAllUsers();
        setUsers([])
        setFetching(false)
    }

    useEffect(() => {
        getAllUsers()
    }, [])

    return (
        <>
            {fetching === false && <AdminUsersTableComponent defaultData={users ?? []} refreshData={getAllUsers} />}

        </>

    )
}


export default function AdminUsersTableComponent({ defaultData, refreshData }: { defaultData: AdminUser[], refreshData: () => void }) {
    const [data, _setData] = useState(() => [...defaultData])
    const rerender = useReducer(() => ({}), {})[1]
    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
    const [addingUser, setAddingUser] = useState<boolean>(false);
    const [errMsgAddingUser, setErrMsgAddingUser] = useState<string>()
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<AdminUser>()

    const handleDeleteDialogOpen = (row: Row<AdminUser>) => {
        setDeleteUserDialogOpen(true)
        setSelectedUser(row.original)
    }


    const handleDeleteUser = async () => {
        if (selectedUser) {
            // const response = await services.deleteUser(selectedUser.id)
            // if (response.statusCode === 200 || response.statusCode === 204) {
            //     setSelectedUser(undefined)
            //     setDeleteUserDialogOpen(false)
            //     _setData(data.filter((d) => d.id !== selectedUser.id))
            //     toast.success("AdminUser deleted")
            // }

        }



    }

    const columns = useMemo(() => generateColumns(handleDeleteDialogOpen), [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAddUser = async (userInputs: z.infer<typeof AddUserSchema>) => {
        setErrMsgAddingUser("")
        setAddingUser(true)
        const newUser = await services.admin.createUser(userInputs);
        const errMsg = newUser as Message
        setAddingUser(false)
        if (errMsg.statusCode === 400) {
            setErrMsgAddingUser(errMsg.message);

            return
        }
        _setData([(newUser as AdminUser), ...data])
        setAddUserDialogOpen(false)
    }

    const handleAddUserDialogOpen = (open: boolean) => {
        setErrMsgAddingUser("")
        setAddUserDialogOpen(open)
    }



    return (
        <>
            <AddUserDialog
                open={addUserDialogOpen}
                onOpenChange={handleAddUserDialogOpen}
                onSubmit={handleAddUser}
                buttonDisabled={addingUser}
                errMessage={errMsgAddingUser}
            />
            <DeleteUserDialog
                open={deleteUserDialogOpen}
                onDelete={handleDeleteUser}
                onCancel={() => setDeleteUserDialogOpen(false)}


            />
            <div className="w-full mt-10 flex flex-col">
                <div className="m-2 flex flex-col">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        All Users
                    </h3>
                    <div className="self-end">
                        <Button onClick={() => setAddUserDialogOpen(true)} ><Plus />Add new user</Button>
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

export const AddUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email()
})


function AddUserDialog({ onSubmit, buttonDisabled, errMessage, ...props }: ComponentProps<FC<DialogProps>> & {
    onSubmit: SubmitHandler<z.infer<typeof AddUserSchema>>
    buttonDisabled?: boolean
    errMessage: string | undefined

}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { open, defaultOpen, onOpenChange } = props

    const form = useForm<z.infer<typeof AddUserSchema>>({
        resolver: zodResolver(AddUserSchema),
        defaultValues: {
            name: "",
            email: ""
        },
    })


    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add new user</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Formi {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="User name" {...field} />

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="User email" {...field} />

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {errMessage &&
                            <p className="text-destructive text-sm">
                                {errMessage}
                            </p>}
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

function DeleteUserDialog({ onDelete, onCancel, ...props }: ComponentProps<typeof AlertDialogPrimitive.Root> & {
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
