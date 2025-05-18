import { useEditor, EditorContent, Editor, Extension } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import BoldT from '@tiptap/extension-bold'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import { memo, useEffect } from 'react'

import { useDebouncedCallback } from 'use-debounce';
import { cx } from 'class-variance-authority'

type EditorProps = {
    defaultLabel: string | undefined,
    editable: boolean,
    onUpdateContent: (content: string) => void,
}


const PreventEnter = Extension.create({
    addKeyboardShortcuts(this) {
        return {
            'Enter': () => true
        }
    },
})

const FormTitleEditor = ({ defaultLabel, editable, onUpdateContent
}:
    EditorProps) => {

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateContent(json);
    }, 1000);


    const editor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph.configure({
                HTMLAttributes: {
                    class: cx(
                        "scroll-m-20 text-2xl font-semibold tracking-tight",
                    ),
                },
            }),
            PreventEnter,
            TextStyle,
            BoldT,
            Heading.configure({
                levels: [1],


            }),
            Placeholder.configure({
                placeholder: "Form title"
            })
        ],
        content: defaultLabel,
        immediatelyRender: false,
        editable: editable,
        onUpdate: ({ editor }) => {
            if (editor.isEmpty) {
                editor.commands.setBold()


            }
            debounceUpdates(editor);
        },
    })

    useEffect(() => {
        if (!editor) {
            return undefined
        }
        editor.setEditable(!editable)
    }, [editor, editable])

    if (!editor) return null

    return (<>
        <EditorContent editor={editor} spellCheck={editable} />

    </>)
}

export default memo(FormTitleEditor)

