import { useEditor, EditorContent, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import UnderlineT from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
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

const colorSelectors = [
    {
        name: "red",
        color: "#fb2c36",
        twBorderColor: "border-red-600/40",
        twTextColor: "text-red-600/40"
    },
    {
        name: "blue",
        color: "#155dfc",
        twBorderColor: "border-blue-600/40",
        twTextColor: "text-blue-600/40"
    },
    {
        name: "purple",
        color: "#9810fa",
        twBorderColor: "border-purple-600",
        twTextColor: "text-purple-600/40"
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

function LabelEditor({ currentLabel, editable, onUpdateLabelContent, id }:
    { currentLabel: string, editable: boolean, onUpdateLabelContent: (content: string, id: string) => void, id: string }) {
    const [colorSelectorOpen, setColorSelectorOpen] = useState(false)

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateLabelContent(json, id);
    }, 1000);

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
                    <PopoverContent className="w-51" align="start">
                        <h5 className="text-xs">Text color</h5>
                        <div className="flex flex-row flex-wrap gap-2 mt-2">
                            {colorSelectors.map((el, i) => {
                                let isColorActive = labelEditor.isActive('textStyle', { color: el.color })
                                return (
                                    <Toggle
                                        pressed={isColorActive}
                                        key={i}
                                        variant={"outline"}
                                        className={`${el.twBorderColor} ${isColorActive && `border-2`}`}
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
        <FormLabel>
            <EditorContent editor={labelEditor} spellCheck={editable} />
        </FormLabel>
    </>)
}

export default memo(LabelEditor)

