import { LucideProps } from "lucide-react";
import { ReactElement, ReactNode, RefObject } from "react";
import { Control, RegisterOptions } from "react-hook-form";

export enum Droppables {
  Questions = "Questions",
  Fields = "Fields",
  Bin = "Bin",
}

export enum DraggableFields {
  Text = "Text",
  Date = "Date",
  Checkbox = "Checkbox",
}

export enum ControlPanel {
  Fields = "Fields",
  Properties = "Properties",
}

export type FieldTypes = keyof typeof DraggableFields;

export type ControlPanelTypes = keyof typeof ControlPanel;

export interface BaseQuestion {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  description: string;
  selected: boolean;
  required: boolean;
}

export interface TextQuestion extends BaseQuestion {
  type: DraggableFields.Text;
  defaultValue?: string;
  long?: boolean;
}

export interface DateQuestion extends BaseQuestion {
  type: DraggableFields.Date;
  defaultValue?: Date;
}

export interface CheckboxQuestion extends BaseQuestion {
  type: DraggableFields.Checkbox;
  defaultValue?: boolean;
}

export type Question = TextQuestion | DateQuestion | CheckboxQuestion;

export type QuestionDefaultValue = Question["defaultValue"];

export type QuestionSchema = {
  [x: string]: QuestionDefaultValue;
};

export interface Fields {
  name: FieldTypes;
  displayName: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

export type FieldsProps = {
  form: any;
  index: number;
  previewOn: boolean;
  onUpdateLabelContent: (content: string, id: string) => void;
  onSelectQuestion: () => void;
  popoverRef: RefObject<HTMLDivElement | null>;
};

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string
    ? string extends T[K]
      ? K
      : never
    : never;
}[keyof T];

export type StringPropsOnly<T> = Pick<T, StringKeys<T>>;

export type QuestionStringPropsKeys = keyof StringPropsOnly<Question>;

// Property types
export interface PropertiesProps {
  NameContent: string | undefined;
  Required: boolean;
  Description: boolean;
  DescriptionContent: string | undefined;
  Placeholder: boolean;
  PlaceholderContent: string | undefined;
  Long?: boolean;
}

export enum PropertiesTypes {
  Switch = "Switch",
  Button = "Button",
  Text = "Text",
}

export type PropertiesRequiredProps =
  | {
      name: keyof PropertiesProps;
      type: PropertiesTypes.Switch;
      control: Control<PropertiesProps, any>;
      defaultValue: boolean;
      switchCheckedOnChange: (checked: boolean) => void;
      textField: true;
      textFieldDefaultValue: string | undefined;
      textFieldOnChange: (e: string) => void;
      textFieldName: keyof PropertiesProps;
      textValidationRules?:
        | Omit<
            RegisterOptions<PropertiesProps, keyof PropertiesProps>,
            "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
          >
        | undefined;
    }
  | {
      name: keyof PropertiesProps;
      type: PropertiesTypes.Switch;
      control: Control<PropertiesProps, any>;
      defaultValue: boolean;
      switchCheckedOnChange: (checked: boolean) => void;
      textField: false;
    }
  | {
      label: string;
      type: PropertiesTypes.Button;
      icon: ReactNode;
      onClick: () => void;
    }
  | {
      label: string;
      type: PropertiesTypes.Text;
      control: Control<PropertiesProps, any>;
      fieldDefaultValue: string | undefined;
      fieldOnChange: (e: string) => void;
      fieldName: keyof PropertiesProps;
      validationRules?:
        | Omit<
            RegisterOptions<PropertiesProps, keyof PropertiesProps>,
            "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
          >
        | undefined;
    };
