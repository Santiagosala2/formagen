import { useEditor, EditorContent, Editor, Extension } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import BoldT from '@tiptap/extension-bold'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import { Color } from '@tiptap/extension-color'
import { memo, RefObject, useEffect } from 'react'

import { useDebouncedCallback } from 'use-debounce';

type EditorProps = {
    defaultLabel: string | undefined,
    editable: boolean,
    onUpdateLabelContent: (content: string) => void,
}


const PreventEnter = Extension.create({
    addKeyboardShortcuts(this) {
        return {
            'Enter': () => true
        }
    },
})

const FormNameEditor = ({ defaultLabel, editable, onUpdateLabelContent
}:
    EditorProps) => {

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateLabelContent(json);
    }, 1000);


    const labelEditor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph,
            PreventEnter,
            TextStyle,
            BoldT,
            Heading.configure({
                levels: [1],


            }),
            Placeholder.configure({
                placeholder: "Form name"
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
        if (!labelEditor) {
            return undefined
        }
        labelEditor.setEditable(!editable)
    }, [labelEditor, editable])

    if (!labelEditor) return null

    return (<>
        <EditorContent editor={labelEditor} spellCheck={editable} />

    </>)
}

export default memo(FormNameEditor)

