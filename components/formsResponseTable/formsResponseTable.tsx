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
import { ArrowLeft, Check, Edit, File, MoreHorizontal, Plus, Share, Trash, View } from "lucide-react";
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
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogProps } from "@radix-ui/react-dialog"
import { Loader2Icon } from "lucide-react"
import { ComponentProps, FC, ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { captializeFirst, formatToAEST } from "@/utils/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { User } from "../usersTable/types";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipWrapper } from "../ui/tooltip";
import { FormResponse, FormResponseTableKeys, SharedUser } from "./types";


import Link from "next/link"

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import dynamic from "next/dynamic";
import { FormBuilder } from "../formBuilder/formBuilder";
import { SetDefaultFormData } from "../formBuilder/setFormBuilder";
import { Form } from "../formsTable/types";


const columnHelper = createColumnHelper<FormResponse>()

// const dynamicColumns = (data: FormResponse[]): ColumnDef<FormRe, any>[] => {
//     return []
// }

const generateColumns = (): ColumnDef<FormResponse, any>[] => {
    const columns = [
        columnHelper.accessor("user", {
            header: props => captializeFirst(props.column.id),
            cell: props => props.getValue().name
        }),
        columnHelper.accessor("created", {
            header: props => captializeFirst("submitted"),
            cell: props => formatToAEST(props.getValue()!)
        }),
        columnHelper.display({
            id: "actions",
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <TooltipWrapper name="View form">
                    <Button onClick={() => { }} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
                        <View />
                    </Button>
                </TooltipWrapper>
            </div>

        }),
        //...dynamicColumns(data)

    ]
    return columns
}

export function SetResponseTable({
    formId
}: {
    formId: string
}) {
    const [responses, setResponses] = useState<FormResponse[]>([])
    const [formDetails, setFormDetails] = useState<Form>()
    const [fetching, setFetching] = useState<boolean>(false)

    const getAllResponses = async () => {
        setFetching(true)
        const form = await services.form.getForm(formId) as Form;
        const formResponses = await services.form.getFormResponses(formId);
        setFormDetails(form)
        setResponses(formResponses)
        console.log(responses)
        setFetching(false)
    }

    useEffect(() => {
        getAllResponses()
    }, [])

    return (
        <>
            {fetching ?
                (<Loader2Icon />) :
                (<ResponseTableComponent responses={responses} formDetails={formDetails} refreshData={getAllResponses} />)
            }

        </>

    )
}


export default function ResponseTableComponent({ formDetails, responses, refreshData }: { formDetails?: Form, responses: FormResponse[], refreshData: () => void }) {
    const [data, _setData] = useState(() => [...responses])
    const [viewFormDialogOpen, setViewFormDialogOpen] = useState(false)
    const columns = useMemo(() => generateColumns(), [])


    console.log(data)
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>

            <div className="w-full mt-10 flex flex-col">
                <BreadcrumbDemo />
                <h3 className="mx-2 my-7 scroll-m-20 text-2xl font-semibold tracking-tight">
                    {formDetails?.name}
                </h3>
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
                <Dialog open={false}>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>{`View`}</DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <FormBuilder id={"2w2"} name="" title="" description="ffff"  {...SetDefaultFormData([])} submit={true} view={true} />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}



function BreadcrumbDemo() {
    return (
        <Breadcrumb className="mx-2">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard/forms">Forms</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>View responses</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

