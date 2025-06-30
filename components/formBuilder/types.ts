import { LucideProps } from "lucide-react";
import { ReactElement, ReactNode, RefObject } from "react";
import { Control, RegisterOptions } from "react-hook-form";

export enum Droppables {
  Questions = "Questions",
  Fields = "Fields",
  Bin = "Bin",
  RadioOption = "RadioOption",
}

export enum DraggableFields {
  Text = "Text",
  Date = "Date",
  Checkbox = "Checkbox",
  Radio = "Radio",
}

export enum ControlPanel {
  Fields = "Fields",
  Properties = "Properties",
}

export type FieldTypes = keyof typeof DraggableFields;

export type ControlPanelTypes = keyof typeof ControlPanel;

export type DateRestrictionRule = "past" | "future";

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
  dateRestriction?: boolean;
  dateRestrictionRule?: DateRestrictionRule;
}

export interface CheckboxQuestion extends BaseQuestion {
  type: DraggableFields.Checkbox;
  defaultValue?: boolean;
}

export interface RadioQuestion extends BaseQuestion {
  type: DraggableFields.Radio;
  items: Array<string>;
  defaultValue?: string;
}

export type Question =
  | TextQuestion
  | DateQuestion
  | CheckboxQuestion
  | RadioQuestion;

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
  onOptionUpdate?: (optionId: number, content: string) => void;
  onOptionsUpdate?: (questionId: string, options: Array<string>) => void;
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
  DateRestriction?: boolean;
  DateRestrictionRule: DateRestrictionRule;
}

export enum PropertiesTypes {
  Switch = "Switch",
  Button = "Button",
  Text = "Text",
}

export type PropertiesKeys = keyof PropertiesProps;

export type PropertiesRequiredProps =
  | {
      name: keyof PropertiesProps;
      displayName?: string;
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
      children?: ReactNode;
    }
  | {
      name: keyof PropertiesProps;
      displayName?: string;
      type: PropertiesTypes.Switch;
      control: Control<PropertiesProps, any>;
      defaultValue: boolean;
      switchCheckedOnChange: (checked: boolean) => void;
      textField: false;
      children?: ReactNode;
    }
  | {
      name: keyof PropertiesProps;
      displayName?: string;
      type: PropertiesTypes.Switch;
      control: Control<PropertiesProps, any>;
      defaultValue: boolean;
      switchCheckedOnChange: (checked: boolean) => void;
      textField: false;
      children: ReactNode;
    }
  | {
      label: string;
      displayName?: string;
      type: PropertiesTypes.Button;
      icon: ReactNode;
      onClick: () => void;
    }
  | {
      label: string;
      displayName?: string;
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
