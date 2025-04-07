import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'
import { FormLabel } from './form'
import { Toggle } from './toggle'



export default function LabelEditor({ currentLabel, editable }: { currentLabel: string, editable: boolean }) {
    const labelEditor = useEditor({
        extensions: [StarterKit],
        content: `<p>${currentLabel}</p>`,
        immediatelyRender: false,
        editable: editable
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
            isActive: labelEditor.isActive('strike'),
            command: () => labelEditor.chain().focus().toggleStrike().run(),
            icon: Underline
        }

    ]


    /* Tasks
Add editor bubble menu
update the label content into the question added array - use a debounce pattern , and use react memo to only update one item
*/

    return (<>

        <BubbleMenu className="rounded-md border bg-background shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50" tippyOptions={{ duration: 100 }} editor={labelEditor}>
            <ToggleGroup type="multiple" value={textSelectors.filter(selector => selector.isActive).map(selector => selector.name)} >
                {textSelectors.map((s, i) => (
                    <ToggleGroupItem key={i} value={s.name} aria-label={`Toggle ${s.name}`} onClick={s.command}>
                        <s.icon className='h-1 w-1' />
                    </ToggleGroupItem>
                ))}
                <Toggle className='border-l-1' aria-label="Toggle italic">
                    <Italic className="h-4 w-4" />
                </Toggle>
            </ToggleGroup>

        </BubbleMenu>
        <FormLabel>
            <EditorContent editor={labelEditor} spellCheck={editable} />
        </FormLabel>

    </>)
}

