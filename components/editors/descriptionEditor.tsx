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
import { useDebouncedCallback } from 'use-debounce';
import { Editor, EditorContent, Extension, useEditor } from '@tiptap/react';
import { cx } from 'class-variance-authority';

type EditorProps = {
    defaultValue: string | undefined,
    editable: boolean,
    onUpdateContent: (content: string) => void,
    popoverRef: RefObject<HTMLDivElement | null>
}

const DescriptionEditor = ({ defaultValue, editable, onUpdateContent, popoverRef
}:
    EditorProps) => {

    const debounceUpdates = useDebouncedCallback(async (editor: Editor) => {
        const json = editor.getHTML();
        onUpdateContent(json);
    }, 500);


    const editor = useEditor({
        extensions: [
            Document,
            Text,
            Paragraph,
            TextStyle,
            Color,
            LinkT.configure({
                HTMLAttributes: {
                    class: cx(
                        "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
                    ),
                },
            }),
            BoldT,
            ItalicT,
            UnderlineT,
            Placeholder.configure({
                placeholder: "Description (Optional)"
            })
        ],
        content: defaultValue,
        immediatelyRender: false,
        editable: editable,
        onUpdate: ({ editor }) => {
            debounceUpdates(editor);
        }
    })

    useEffect(() => {
        if (!editor) {
            return undefined
        }
        editor.setEditable(!editable)
    }, [editor, editable])

    if (!editor) return null

    return (

        <>
            <BubbleMenu editor={editor} ref={popoverRef} />
            <EditorContent editor={editor} spellCheck={editable} />
        </>)
}


export default memo(DescriptionEditor)

