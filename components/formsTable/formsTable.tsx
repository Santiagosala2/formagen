"use client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

import * as React from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { FormTable, FormTableKeys } from "./types";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import { AddFormDialog } from "./addFormDialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import services from "@/services/form";
import { redirect } from "next/navigation";



const defaultData: FormTable[] = [
    {
        name: "Employee Onboarding",
        lastUpdated: new Date("2025-05-10T10:15:00Z"),
        created: new Date("2025-04-01T08:30:00Z"),
        status: "Active",
    },
    {
        name: "Annual Review",
        lastUpdated: new Date("2025-05-15T14:45:00Z"),
        created: new Date("2025-03-20T09:00:00Z"),
        status: "Active",
    },
    {
        name: "Leave Request",
        lastUpdated: new Date("2025-05-12T11:00:00Z"),
        created: new Date("2025-05-05T08:00:00Z"),
        status: "Active",
    },
    {
        name: "Exit Interview",
        lastUpdated: new Date("2025-05-17T16:20:00Z"),
        created: new Date("2025-04-30T10:00:00Z"),
        status: "Active",
    },
];
const columnHelper = createColumnHelper<FormTable>()

const captializeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const formatToAEST = (date: Date) => format(date, "dd/MM/yyyy")
const columns = [
    columnHelper.accessor(FormTableKeys.name, {
        header: props => captializeFirst(props.column.id)
    }),
    columnHelper.accessor(FormTableKeys.status, {
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
            <Button className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
                <Edit />
            </Button>
            <Button className="text-destructive cursor-pointer hover:border-destructive hover:text-destructive hover:bg-transparent" variant="outline" size="icon">
                <Trash />
            </Button>
        </div>

    }),

]
export default function FormTableC() {
    const [data, _setData] = React.useState(() => [...defaultData])
    const rerender = React.useReducer(() => ({}), {})[1]
    const [addFormDialogOpen, setAddFormDialogOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [addingForm, setAddingForm] = React.useState<boolean>(false)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAddForm = async () => {
        setAddingForm(true)
        const newForm = await services.createForm({
            name: inputRef!.current!.value
        })
        setAddingForm(false)
        console.log(newForm)
        redirect(`/build/${newForm.id}`)
    }

    return (
        <>
            <AddFormDialog
                open={addFormDialogOpen}
                onOpenChange={(open) => setAddFormDialogOpen(open)}
                onSubmit={handleAddForm}
                buttonLabel="Add"
                title="Add form"
                buttonDisabled={addingForm}
                content={
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            ref={inputRef}
                            id="name"
                            defaultValue=""
                            className="col-span-3"
                        />
                    </div>
                }
            />
            <div className="w-4/5 mt-10 flex flex-col">
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
            </div>
        </>
    )
}