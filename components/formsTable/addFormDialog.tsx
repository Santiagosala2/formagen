import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogProps } from "@radix-ui/react-dialog"
import { title } from "process"
import { FC, ReactNode } from "react"

export function AddFormDialog({ onSubmit, title, description, content, buttonLabel, ...props }: React.ComponentProps<FC<DialogProps>> & {
    onSubmit: () => void
    title: string
    description?: string
    content: ReactNode
    buttonLabel: string

}) {

    const { open, defaultOpen, onOpenChange } = props

    return (
        <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {content}
                <DialogFooter>
                    <Button onClick={onSubmit} type="submit">{buttonLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
