import { RefObject } from "react";

export enum Droppables {
    Questions = "Questions",
    Fields = "Fields",
    Bin = "Bin"
}

export enum DraggableFields {
    Text = "Text",
    Date = "Date"
}

export enum ControlPanel {
    Fields = "Fields",
    Properties = "Properties"
}

export type FieldTypes = keyof typeof DraggableFields

export type ControlPanelTypes = keyof typeof ControlPanel;

export interface BaseQuestion {
    id: string,
    name: string
    label: string
    placeholder: string
    description: string
    selected: boolean
    required: boolean
}

export interface TextQuestion extends BaseQuestion {
    type: DraggableFields.Text
    defaultValue?: string 
    long?: boolean
}

export interface DateQuestion extends BaseQuestion {
    type: DraggableFields.Date
    defaultValue?: Date 
}

export type Question = TextQuestion | DateQuestion;


export interface Fields {
    name: FieldTypes
    displayName: string
}

export type FieldsProps = {
    
    form: any
    index: number
    previewOn: boolean
    onUpdateLabelContent: (content: string, id: string) => void
    onSelectQuestion: () => void
    outsideFormClickRef: RefObject<HTMLDivElement | null>
    
}

export interface PropertiesProps {
    Required: boolean
    Description: boolean
    DescriptionContent: string | undefined
    Placeholder: boolean
    PlaceholderContent: string | undefined
    Long?: boolean

}
