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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { FormResponse } from "./types";


const columnHelper = createColumnHelper<FormResponse>()

// const generateColumns = (onDelete: (row: Row<FormResponse>) => void, onShare: (row: Row<FormResponse>) => void): ColumnDef<FormResponse, any>[] => {
//     const columns = [
//         columnHelper.accessor(ResponseTableKeys.name, {
//             header: props => captializeFirst(props.column.id)
//         }),
//         columnHelper.accessor(ResponseTableKeys.lastUpdated, {
//             header: props => "Last Updated",
//             cell: props => formatToAEST(props.getValue()!)
//         }),
//         columnHelper.accessor(ResponseTableKeys.created, {
//             header: props => captializeFirst(props.column.id),
//             cell: props => formatToAEST(props.getValue()!)
//         }),
//         columnHelper.display({
//             id: ResponseTableKeys.actions,
//             header: props => captializeFirst(props.column.id),
//             cell: props => <div className="flex gap-2">
//                 <TooltipWrapper name="Edit form">
//                     <Button onClick={() => redirect(`/build/${(props.row).original.id}`)} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
//                         <Edit />
//                     </Button>
//                 </TooltipWrapper>
//                 <TooltipWrapper name="View responses">
//                     <Button onClick={() => (props.row)} className="text-lime-600 cursor-pointer hover:border-lime-600 hover:text-lime-600 hover:bg-transparent" variant="outline" size="icon">
//                         <File />
//                     </Button>
//                 </TooltipWrapper>
//                 <TooltipWrapper name="Share form">
//                     <Button onClick={() => onShare(props.row)} className="text-cyan-600 cursor-pointer hover:border-cyan-600 hover:text-cyan-600 hover:bg-transparent" variant="outline" size="icon">
//                         <Share />
//                     </Button>
//                 </TooltipWrapper>
//                 <TooltipWrapper name="Delete form">
//                     <Button onClick={() => onDelete(props.row)} className="text-destructive cursor-pointer hover:border-destructive hover:text-destructive hover:bg-transparent" variant="outline" size="icon">
//                         <Trash />
//                     </Button>
//                 </TooltipWrapper>
//             </div>

//         }),

//     ]
//     return columns
// }

export function SetResponseTable({
    formId
}: {
    formId: string
}) {
    const [forms, setForms] = useState<FormResponse[]>()
    const [fetching, setFetching] = useState<boolean>()

    const getAllResponses = async () => {
        setFetching(true)
        const forms = [] as FormResponse[]
        //await services.form.getFormResponse(formId);
        setForms(forms)
        console.log(forms)
        setFetching(false)
    }

    useEffect(() => {
        getAllResponses()
    }, [])

    return (
        <>
            {fetching === false && <ResponseTableComponent defaultData={forms ?? []} refreshData={getAllResponses} />}

        </>

    )
}


export default function ResponseTableComponent({ defaultData, refreshData }: { defaultData: FormResponse[], refreshData: () => void }) {

    //const columns = useMemo(() => generateColumns(handleDeleteDialogOpen, handleShareDialogOpen), [])


    return (
        <>
            <div className="w-full mt-10 flex flex-col">
                <Table>
                    <TableHeader>
                        {/* {table.getHeaderGroups().map(headerGroup => (
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
                        ))} */}
                    </TableHeader>
                    <TableBody>
                        {/* {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))} */}
                    </TableBody>
                </Table>
                <Toaster position="bottom-center" />
            </div>
        </>
    )
}


