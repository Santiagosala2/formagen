import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import UnderlineT from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color'
import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Bold, ChevronDown, Italic, Underline } from 'lucide-react'
import { FormLabel } from './form'
import { Toggle } from './toggle'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"




export default function LabelEditor({ currentLabel, editable }: { currentLabel: string, editable: boolean }) {
    const [colorSelectorOpen, setColorSelectorOpen] = useState(false)

    const labelEditor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            UnderlineT,
            Placeholder.configure({
                placeholder: "Question name"
            })
        ],
        content: `<p>${currentLabel}</p>`,
        immediatelyRender: false,
        editable: editable,
    })

    useEffect(() => {
        if (!labelEditor) {
            return undefined
        }
        labelEditor.setEditable(!editable)
    }, [labelEditor, editable])

    if (!labelEditor) return null


    const textSelectors = [
        {
            name: "bold",
            isActive: labelEditor.isActive('bold'),
            command: () => labelEditor.chain().focus().toggleBold().run(),
            icon: Bold
        },
        {
            name: "italic",
            isActive: labelEditor.isActive('italic'),
            command: () => labelEditor.chain().focus().toggleItalic().run(),
            icon: Italic
        },
        {
            name: "strike",
            isActive: labelEditor.isActive('underline'),
            command: () => labelEditor.chain().focus().toggleUnderline().run(),
            icon: Underline
        }

    ]

    const colorSelectors = [
        {
            name: "red",
            color: "#fb2c36",
            tailwindColor: "border-red-600/40"
        },
        {
            name: "blue",
            color: "#155dfc",
            tailwindColor: "border-blue-600/40"
        },
        {
            name: "purple",
            color: "#9810fa",
            tailwindColor: "border-purple-600/40"
        }

    ]

    const handleColorSelectorChange = (color: string) => {
        if (labelEditor.isActive('textStyle', { color: color })) {
            labelEditor.chain().focus().unsetColor().run();
        } else {
            labelEditor.chain().focus().setColor(color).run();
        }


        setColorSelectorOpen(false)

    }

    const activeColorItem = colorSelectors.find(({ color }) => labelEditor.isActive("textStyle", { color }));

    /* Tasks
Add editor bubble menu
update the label content into the question added array - use a debounce pattern , and use react memo to only update one item
*/

    return (<>

        <BubbleMenu className="rounded-md border shadow-xs bg-card" tippyOptions={{ duration: 100 }} editor={labelEditor}>
            <ToggleGroup type="multiple" value={textSelectors.filter(selector => selector.isActive).map(selector => selector.name)} >
                {textSelectors.map((s, i) => (
                    <ToggleGroupItem key={i} value={s.name} aria-label={`Toggle ${s.name}`} onClick={s.command}>
                        <s.icon className='h-1 w-1' />
                    </ToggleGroupItem>
                ))}
                <Popover open={colorSelectorOpen} onOpenChange={setColorSelectorOpen}  >
                    <PopoverTrigger asChild>
                        <Toggle className={`border-l-1 ${activeColorItem ? `text-${activeColorItem.tailwindColor}` : ''}`} aria-label="Toggle color selector" >
                            A
                            <ChevronDown />
                        </Toggle>
                    </PopoverTrigger>
                    <PopoverContent className="w-51" align="start">
                        <h5 className="text-xs">Text color</h5>
                        <div className="flex flex-row flex-wrap gap-2 mt-2">
                            {colorSelectors.map((el, i) => (
                                <Toggle pressed={labelEditor.isActive('textStyle', { color: el.color })} key={i} variant={"outline"} className={`${el.tailwindColor} ${labelEditor.isActive('textStyle', { color: el.color }) ? 'border-2' : ''}`} aria-label={`Toggle color ${el.name}`} onPressedChange={() => handleColorSelectorChange(el.color)}>
                                    A
                                </Toggle>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </ToggleGroup>
        </BubbleMenu>
        <FormLabel>
            <EditorContent editor={labelEditor} spellCheck={editable} />
        </FormLabel>
    </>)
}

// function ColorSelector({ open, onOpenChange }: {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }) {
//     return (

//     )
// }

