import BubbleMenu from './bubbleMenu'
import ItalicT from '@tiptap/extension-italic'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import UnderlineT from '@tiptap/extension-underline';
import BoldT from '@tiptap/extension-bold'
import Text from '@tiptap/extension-text'
import LinkT from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import { Color } from '@tiptap/extension-color'
import { memo, RefObject, useEffect, useState } from 'react'
import { FormLabel } from '../ui/form'
import { useDebouncedCallback } from 'use-debounce';
import { Editor, EditorContent, Extension, useEditor } from '@tiptap/react';
import { cx } from 'class-variance-authority';

type EditorProps = {
    defaultLabel: string,
    editable: boolean,
    onUpdateLabelContent: (content: string, id: string) => void,
    id: string
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

const RootLabelEditor = ({ defaultLabel, editable, onUpdateLabelContent, id, popoverRef, required
}:
    EditorProps) => {

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateLabelContent(json, id);
    }, 500);


    const labelEditor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph,
            PreventEnter,
            TextStyle,
            Color,
            BoldT,
            LinkT.configure({
                HTMLAttributes: {
                    class: cx(
                        "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
                    ),
                },
            }),
            ItalicT,
            UnderlineT,
            Placeholder.configure({
                placeholder: "Question name"
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
        if (!labelEditor) {
            return undefined
        }
        labelEditor.setEditable(!editable)
    }, [labelEditor, editable])

    if (!labelEditor) return null

    return (

        <>
            <BubbleMenu editor={labelEditor} ref={popoverRef} />
            <FormLabel className='gap-0'>
                <EditorContent editor={labelEditor} spellCheck={editable} />
                {required && <p className='text-red-500'>*</p>}
            </FormLabel>

        </>)
}


export default memo(RootLabelEditor)

