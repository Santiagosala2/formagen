import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import { memo, RefObject, useEffect } from 'react'
import { FormLabel } from '../ui/form'
import { useDebouncedCallback } from 'use-debounce';
import { Editor, EditorContent, Extension, useEditor } from '@tiptap/react';

type EditorProps = {
    defaultLabel: string,
    editable: boolean,
    onUpdateLabelContent: (optionId: number, content: string) => void,
    optionId: number
    popoverRef: RefObject<HTMLDivElement | null>
    required: boolean
}

const PreventEnter = Extension.create({
    addKeyboardShortcuts(this) {
        return {
            'Enter': () => true
        }
    },
})

const RootOptionEditor = ({ defaultLabel, editable, onUpdateLabelContent, optionId
}:
    EditorProps) => {

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const text = editor.getHTML();
        onUpdateLabelContent(optionId, text);
    }, 500);


    const optionEditor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph,
            PreventEnter,
            Placeholder.configure({
                placeholder: "Option name"
            })
        ],
        content: defaultLabel,
        immediatelyRender: false,
        editable: editable,
        onUpdate: ({ editor }) => {
            debounceUpdates(editor);
        }
    })

    useEffect(() => {
        if (!optionEditor) {
            return undefined
        }
        optionEditor.setEditable(!editable)
    }, [optionEditor, editable])

    if (!optionEditor) return null

    return (

        <>
            <FormLabel className='gap-0'>
                <EditorContent editor={optionEditor} spellCheck={editable} />
            </FormLabel>

        </>)
}


export default memo(RootOptionEditor)

