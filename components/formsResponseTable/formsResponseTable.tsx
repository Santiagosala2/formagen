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
import { Button } from "../ui/button";
import { services } from "@/services";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2Icon, View } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { captializeFirst, formatToAEST } from "@/utils/utils";
import { TooltipWrapper } from "../ui/tooltip";
import { FormResponse } from "./types";


import Link from "next/link"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FormBuilder } from "../formBuilder/formBuilder";
import { SetDefaultFormData } from "../formBuilder/setFormBuilder";
import { Form } from "../formsTable/types";
import { FormBuilderMode } from "../formBuilder/types";


const columnHelper = createColumnHelper<FormResponse>()

const generateColumns = (onView: (row: Row<FormResponse>) => void): ColumnDef<FormResponse, any>[] => {
    const columns = [
        columnHelper.accessor("user", {
            header: props => captializeFirst(props.column.id),
            cell: props => props.getValue().name
        }),
        columnHelper.accessor("created", {
            header: () => captializeFirst("submitted"),
            cell: props => formatToAEST(props.getValue()!)
        }),
        columnHelper.display({
            id: "actions",
            header: props => captializeFirst(props.column.id),
            cell: props => <div className="flex gap-2">
                <TooltipWrapper name="View form">
                    <Button onClick={() => onView(props.row)} className="cursor-pointer hover:bg-transparent" variant="outline" size="icon">
                        <View />
                    </Button>
                </TooltipWrapper>
            </div>

        }),

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
        setFetching(false)
    }

    useEffect(() => {
        getAllResponses()
    }, [])

    return (
        <>
            {fetching ?
                (<Loader2Icon className="w-full flex items-center justify-center animate-spin" />) :
                (<ResponseTableComponent responses={responses} formDetails={formDetails} refreshData={getAllResponses} />)
            }

        </>

    )
}


export default function ResponseTableComponent({ formDetails, responses }: { formDetails?: Form, responses: FormResponse[], refreshData: () => void }) {
    const [data,] = useState(() => [...responses])
    const [viewFormDialogOpen, setViewFormDialogOpen] = useState(false)
    const [viewFormData, setViewFormData] = useState<FormResponse>()


    const handleViewDialogOpen = (row: Row<FormResponse>) => {
        setViewFormDialogOpen(true)
        setViewFormData(row.original)
    }

    const columns = useMemo(() => generateColumns(handleViewDialogOpen), [])

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
                <Dialog open={viewFormDialogOpen} onOpenChange={(open) => setViewFormDialogOpen(open)} >
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>{`View`}</DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <FormBuilder
                            id={viewFormData?.id}
                            name=""
                            title={viewFormData?.title}
                            description={viewFormData?.description}
                            {...SetDefaultFormData(viewFormData?.questions ?? [])}
                            mode={FormBuilderMode.View}
                            enabledSteps={viewFormData?.enabledSteps ?? false}
                            enabledValidateOnJump={false}
                            enabledValidateOnStep={false}
                            steps={viewFormData?.steps ?? []}
                        />
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

