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
import { DialogProps } from "@radix-ui/react-dialog"
import { Loader2Icon } from "lucide-react"
import { FC, ReactNode } from "react"

export function AddFormDialog({ onSubmit, title, description, content, buttonLabel, buttonDisabled, ...props }: React.ComponentProps<FC<DialogProps>> & {
    onSubmit: () => void
    title: string
    description?: string
    content: ReactNode
    buttonLabel: string
    buttonDisabled?: boolean

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
                    <Button onClick={onSubmit} type="submit" disabled={!!buttonDisabled} >
                        {buttonDisabled && <Loader2Icon className="animate-spin" />}
                        {buttonLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
