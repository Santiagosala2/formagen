import { BubbleMenu as BubbleMenuT, Editor } from '@tiptap/react'
import { forwardRef, memo, RefObject, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import { Bold, ChevronDown, Italic, LucideIcon, Underline } from 'lucide-react'
import { Toggle } from '../toggle'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type SelectorItem = {
    name: string;
    icon: LucideIcon;
    command: (editor: Editor) => void;
    isActive: (editor: Editor) => boolean;
};

type BubbleMenuProps = {
    editor: Editor
}

const colorSelectors = [
    {
        name: "red",
        color: "#fb2c36",
        twBorderColor: "border-red-500",
        twTextColor: "text-red-500/80"
    },
    {
        name: "yellow",
        color: "#efb100",
        twBorderColor: "border-yellow-500",
        twTextColor: "text-yellow-500/80"
    },
    {
        name: "lime",
        color: "#7ccf00",
        twBorderColor: "border-lime-500",
        twTextColor: "text-lime-500/80"
    },
    {
        name: "teal",
        color: "#00bba7",
        twBorderColor: "border-teal-500",
        twTextColor: "text-teal-500/80"
    },
    {
        name: "blue",
        color: "#155dfc",
        twBorderColor: "border-blue-500",
        twTextColor: "text-blue-500/80"
    },
    {
        name: "indigo",
        color: "#615fff",
        twBorderColor: "border-indigo-500",
        twTextColor: "text-indigo-500/80"
    },
    {
        name: "purple",
        color: "#9810fa",
        twBorderColor: "border-purple-500",
        twTextColor: "text-purple-500/80"
    },
    {
        name: "fuchsia",
        color: "#e12afb",
        twBorderColor: "border-fuchsia-500",
        twTextColor: "text-fuchsia-500/80"
    }
]

const textSelectors: SelectorItem[] = [
    {
        name: "bold",
        isActive: (editor) => editor.isActive('bold'),
        command: (editor) => editor.chain().focus().toggleBold().run(),
        icon: Bold
    },
    {
        name: "italic",
        isActive: (editor) => editor.isActive('italic'),
        command: (editor) => editor.chain().focus().toggleItalic().run(),
        icon: Italic
    },
    {
        name: "strike",
        isActive: (editor) => editor.isActive('underline'),
        command: (editor) => editor.chain().focus().toggleUnderline().run(),
        icon: Underline
    }

]

const BubbleMenu = forwardRef<HTMLDivElement, BubbleMenuProps>(({ editor
}, ref) => {
    const [colorSelectorOpen, setColorSelectorOpen] = useState(false)

    const handleColorSelectorChange = (isColorActive: boolean, color: string) => {
        if (isColorActive) {
            editor.chain().focus().unsetColor().run();
        } else {
            editor.chain().focus().setColor(color).run();
        }
        setColorSelectorOpen(false)

    }

    const activeColorItem = colorSelectors.find(({ color }) => editor.isActive("textStyle", { color }));

    return (

        <BubbleMenuT className="rounded-md border shadow-xs bg-card" tippyOptions={{ duration: 100 }} editor={editor}>
            <ToggleGroup type="multiple" value={textSelectors.filter(selector => selector.isActive(editor)).map(selector => selector.name)} >
                {textSelectors.map((s, i) => (
                    <ToggleGroupItem key={i} value={s.name} aria-label={`Toggle ${s.name}`} onClick={() => s.command(editor)}>
                        <s.icon className='h-1 w-1' />
                    </ToggleGroupItem>
                ))}

                <Popover open={colorSelectorOpen} onOpenChange={setColorSelectorOpen}  >
                    <PopoverTrigger asChild>
                        <Toggle className={`border-l-1  ${activeColorItem && `${activeColorItem.twTextColor}`}`} aria-label="Toggle color selector" >
                            A
                            <ChevronDown />
                        </Toggle>
                    </PopoverTrigger>
                    <PopoverContent ref={ref} className="w-51" align="start">
                        <h5 className="text-xs">Text color</h5>
                        <div className="flex flex-row flex-wrap gap-2 mt-2">
                            {colorSelectors.map((el, i) => {
                                let isColorActive = editor.isActive('textStyle', { color: el.color })
                                return (
                                    <Toggle
                                        pressed={isColorActive}
                                        key={i}
                                        variant={"outline"}
                                        className={`${el.twBorderColor} ${isColorActive && `border-2`} data-[state=on]:bg-transparent`}
                                        aria-label={`Toggle color ${el.name}`}
                                        onPressedChange={() => handleColorSelectorChange(isColorActive, el.color)}>
                                        A
                                    </Toggle>
                                )
                            }
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </ToggleGroup>
        </BubbleMenuT>
    )
})


export default BubbleMenu