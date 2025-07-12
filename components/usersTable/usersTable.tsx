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
import { User, UserTableKeys } from "./types";
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
import { ComponentProps, FC, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
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
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { captializeFirst } from "@/utils/utils";
import { Message } from "@/services/common";
import { AuthContext } from "../auth/authProvider";


const columnHelper = createColumnHelper<User>()

const generateColumns = (onDelete: (row: Row<User>) => void, onEdit: (row: Row<User>) => void, userContext: { email: string } | null): ColumnDef<User, any>[] => {
    const columns = [
        columnHelper.accessor(UserTableKeys.name, {
            header: props => captializeFirst(props.column.id)
        }),
        columnHelper.accessor(UserTableKeys.email, {
            header: props => captializeFirst(props.column.id),
            cell: props => props.getValue().toLowerCase()
        }),
        columnHelper.display({
            id: UserTableKeys.actions,
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <Button onClick={() => onEdit(props.row)} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
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

export function SetUsersTable() {
    const [users, setUsers] = useState<User[]>()
    const [fetching, setFetching] = useState<boolean>()

    const getAllUsers = async () => {
        setFetching(true)
        // const allUsers = await services.admin.getAllUsers();
        const allUsers = [
            {

                id: "234234234",
                name: "Test",
                email: "test1@gmail.com",
                lastUpdated: new Date(),
                created: new Date()

            }
        ]
        setUsers(allUsers)
        setFetching(false)
    }

    useEffect(() => {
        getAllUsers()
    }, [])

    return (
        <>
            {fetching === false && <UsersTableComponent defaultData={users ?? []} refreshData={getAllUsers} />}

        </>

    )
}


export default function UsersTableComponent({ defaultData, refreshData }: { defaultData: User[], refreshData: () => void }) {
    const [data, _setData] = useState(() => [...defaultData])
    const rerender = useReducer(() => ({}), {})[1]
    const [addEditDialogOpen, setAddEditDialogOpen] = useState(false)
    const [addEditDialogType, setAddEditDialogType] = useState<"edit" | "add">("add")
    const [updatingUser, setUpdatingUser] = useState<boolean>(false);
    const [deletingUser, setDeletingUser] = useState<boolean>(false);
    const [errMsgUpdatingUser, setErrMsgUpdatingUser] = useState<string>()
    const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User>()
    const userContext = useContext(AuthContext)


    const addeditform = useForm<z.infer<typeof AddUserSchema>>({
        resolver: zodResolver(AddUserSchema),
        defaultValues: {
            name: "",
            email: ""
        },
    })

    const handleDeleteDialogOpen = (row: Row<User>) => {
        setDeleteUserDialogOpen(true)
        setSelectedUser(row.original)
    }

    const handleEditDialogOpen = (row: Row<User>) => {
        setAddEditDialogType("edit");
        setSelectedUser(row.original)
        addeditform.reset({
            name: row.original.name,
            email: row.original.email
        })
        setAddEditDialogOpen(true)

    }

    const handleAddDialogOpen = (open: boolean) => {
        setErrMsgUpdatingUser("")
        setAddEditDialogOpen(open)
    }

    const onAddNewUserClick = () => {
        addeditform.reset({
            name: "",
            email: ""
        })
        setAddEditDialogType("add");
        setSelectedUser(undefined);
        setAddEditDialogOpen(true);
    }



    const handleDeleteUser = async () => {
        if (selectedUser) {
            setDeletingUser(true)
            const response = await services.admin.deleteUser(selectedUser.id!)
            if (response.statusCode === 200 || response.statusCode === 204) {
                setSelectedUser(undefined)
                setDeleteUserDialogOpen(false)
                _setData(data.filter((d) => d.id !== selectedUser.id))
                toast.success("User deleted")
            }
            setDeletingUser(false)
        }
    }

    const columns = useMemo(() => generateColumns(handleDeleteDialogOpen, handleEditDialogOpen, userContext), [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAddUser = async (userInputs: z.infer<typeof AddUserSchema>) => {
        setErrMsgUpdatingUser("")
        setUpdatingUser(true)
        const newUser = await services.admin.createUser(userInputs);
        const errMsg = newUser as Message
        setUpdatingUser(false)
        if (errMsg.statusCode === 400) {
            setErrMsgUpdatingUser(errMsg.message);
            return
        }
        _setData([(newUser as User), ...data])
        setAddEditDialogOpen(false)
    }

    const handleEditUser = async (userInputs: z.infer<typeof AddUserSchema>) => {
        setErrMsgUpdatingUser("")
        setUpdatingUser(true)
        const updatedUser = { id: selectedUser?.id, name: userInputs.name }
        const response = await services.admin.saveUser(updatedUser);
        if (response.statusCode === 200) {
            const dataWithoutUser = data.filter(a => a.id !== selectedUser?.id)
            _setData([...dataWithoutUser, { ...updatedUser, email: selectedUser!.email }])
            toast.success("User has been updated");
        }
        setSelectedUser(undefined)
        setUpdatingUser(false)
        setAddEditDialogOpen(false)
    }

    return (
        <>
            <AddEditDialog
                open={addEditDialogOpen}
                onOpenChange={handleAddDialogOpen}
                onSubmit={addEditDialogType === "add" ? handleAddUser : handleEditUser}
                buttonDisabled={updatingUser}
                errMessage={errMsgUpdatingUser}
                edit={addEditDialogType === "edit"}
                form={addeditform}
            />
            <DeleteUserDialog
                open={deleteUserDialogOpen}
                onDelete={handleDeleteUser}
                onCancel={() => setDeleteUserDialogOpen(false)}
                buttonDisabled={deletingUser}
            />
            <div className="w-full mt-10 flex flex-col">
                <div className="m-2 flex flex-col">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        All Users
                    </h3>
                    <div className="self-end">
                        <Button onClick={onAddNewUserClick} ><Plus />Add new user</Button>
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


function AddEditDialog({ onSubmit, buttonDisabled, errMessage, edit, form, ...props }: ComponentProps<FC<DialogProps>> & {
    onSubmit: SubmitHandler<z.infer<typeof AddUserSchema>>
    buttonDisabled?: boolean
    errMessage: string | undefined
    edit?: boolean
    form: UseFormReturn<z.infer<typeof AddUserSchema>>
}

) {
    const { open, defaultOpen, onOpenChange } = props

    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{`${edit ? "Edit" : "Add new"} user`}</DialogTitle>
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
                        {<FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input disabled={edit} placeholder="User email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />}
                        {errMessage &&
                            <p className="text-destructive text-sm">
                                {errMessage}
                            </p>}
                        <DialogFooter>
                            <Button type="submit" disabled={!!buttonDisabled} >
                                {buttonDisabled && <Loader2Icon className="animate-spin" />}
                                {edit ? "Update" : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Formi>
            </DialogContent>
        </Dialog>
    )
}

function DeleteUserDialog({ onDelete, onCancel, buttonDisabled, ...props }: ComponentProps<typeof AlertDialogPrimitive.Root> & {
    onDelete: () => void,
    onCancel: () => void
    buttonDisabled: boolean

}) {

    const { open, defaultOpen, onOpenChange } = props

    return (
        <AlertDialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete user</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} >Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} disabled={buttonDisabled} variant={"destructive"}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
