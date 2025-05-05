import { useEditor, EditorContent, BubbleMenu, Editor, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import UnderlineT from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import { Color } from '@tiptap/extension-color'
import { memo, RefObject, useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Bold, ChevronDown, Italic, LucideIcon, Underline } from 'lucide-react'
import { FormLabel } from './form'
import { Toggle } from './toggle'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDebouncedCallback } from 'use-debounce';

type SelectorItem = {
    name: string;
    icon: LucideIcon;
    command: (editor: Editor) => void;
    isActive: (editor: Editor) => boolean;
};

type EditorProps = {
    defaultLabel: string,
    editable: boolean,
    onUpdateLabelContent: (content: string, id: string) => void,
    id: string
    outsideFormClickRef: RefObject<HTMLDivElement | null>
    required: boolean
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

const PreventEnter = Extension.create({
    addKeyboardShortcuts(this) {
        return {
            'Enter': () => true
        }
    },
})

const RootLabelEditor = memo(({ defaultLabel, editable, onUpdateLabelContent, id, outsideFormClickRef, required
}:
    EditorProps) => {
    const [colorSelectorOpen, setColorSelectorOpen] = useState(false)

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateLabelContent(json, id);
    }, 1000);


    const labelEditor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph,
            PreventEnter,
            TextStyle,
            Color,
            UnderlineT,
            Placeholder.configure({
                placeholder: "Question name"
            })
        ],
        content: `<p>${defaultLabel}</p>`,
        immediatelyRender: false,
        editable: editable,
        onUpdate: ({ editor }) => {
            debounceUpdates(editor);
        }
    })

    useEffect(() => {
        if (!labelEditor) {
            return undefined
        }
        labelEditor.setEditable(!editable)
    }, [labelEditor, editable])

    if (!labelEditor) return null

    const handleColorSelectorChange = (isColorActive: boolean, color: string) => {
        if (isColorActive) {
            labelEditor.chain().focus().unsetColor().run();
        } else {
            labelEditor.chain().focus().setColor(color).run();
        }
        setColorSelectorOpen(false)

    }

    const activeColorItem = colorSelectors.find(({ color }) => labelEditor.isActive("textStyle", { color }));

    return (<>

        <BubbleMenu className="rounded-md border shadow-xs bg-card" tippyOptions={{ duration: 100 }} editor={labelEditor}>
            <ToggleGroup type="multiple" value={textSelectors.filter(selector => selector.isActive(labelEditor)).map(selector => selector.name)} >
                {textSelectors.map((s, i) => (
                    <ToggleGroupItem key={i} value={s.name} aria-label={`Toggle ${s.name}`} onClick={() => s.command(labelEditor)}>
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
                    <PopoverContent ref={outsideFormClickRef} className="w-51" align="start">
                        <h5 className="text-xs">Text color</h5>
                        <div className="flex flex-row flex-wrap gap-2 mt-2">
                            {colorSelectors.map((el, i) => {
                                let isColorActive = labelEditor.isActive('textStyle', { color: el.color })
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
        </BubbleMenu>
        <FormLabel className='gap-0'>
            <EditorContent editor={labelEditor} spellCheck={editable} />
            {required && <p className='text-red-500'>*</p>}
        </FormLabel>
    </>)
})

function LabelEditor({ defaultLabel, ...props }: EditorProps) {
    const [initialLabel, setInitialLabel] = useState<string>()

    useEffect(() => {
        setInitialLabel(defaultLabel)
    }, [])

    if (!initialLabel) return null

    return (
        <RootLabelEditor defaultLabel={initialLabel} {...props} />
    )
}

export default memo(LabelEditor)

