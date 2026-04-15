import { LucideProps } from "lucide-react";
import { ReactElement, ReactNode, RefObject } from "react";
import { Control, FieldPath, FieldValues, Path, RegisterOptions } from "react-hook-form";

export enum Droppables {
  Steps = "Steps",
  Questions = "Questions",
  Fields = "Fields",
  Bin = "Bin",
  RadioOption = "RadioOption",
  CheckboxOption = "CheckboxOption",
  ComboboxOption = "ComboboxOption",
}

export enum DraggableFields {
  Text = "Text",
  Date = "Date",
  Checkbox = "Checkbox",
  Radio = "Radio",
  Signature = "Signature",
  Number = "Number",
  Combobox = "Combobox",
}

export enum DraggableSections {
  Header = "Header"
}

export enum ControlPanel {
  Fields = "Fields",
  Properties = "Properties",
  Steps = "Steps"
}
export type FieldTypes = keyof typeof DraggableFields;

export type FieldSubtypes = "Multiple";

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
  multi?: boolean;
  items?: Array<ChoiceItem>;
  defaultValue?: boolean | Array<string>;
}

export interface RadioQuestion extends BaseQuestion {
  type: DraggableFields.Radio;
  items: Array<ChoiceItem>;
  defaultValue?: string;
}

export interface SignatureQuestion extends BaseQuestion {
  type: DraggableFields.Signature;
  defaultValue?: string;
}

export interface NumberQuestion extends BaseQuestion {
  type: DraggableFields.Number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
}

export interface ComboboxQuestion extends BaseQuestion {
  type: DraggableFields.Combobox;
  items: Array<ChoiceItem>;
  multi?: boolean;
  defaultValue?: string | string[];
}

export type Question =
  | TextQuestion
  | DateQuestion
  | CheckboxQuestion
  | RadioQuestion
  | SignatureQuestion
  | NumberQuestion
  | ComboboxQuestion;

export type QuestionDefaultValue = Question["defaultValue"];

export type QuestionSchema = {
  [x: string]: QuestionDefaultValue;
};

export type StepQuestionId = Question["id"];


export interface Step {
  id: string;
  orderIndex: number;
  description: string;
  title: string;
  questionsIds: StepQuestionId[];
  selected: boolean;
  icon: string;
  formHeader?: string;
  formDescription?: string;
}

export type ChoiceItem = {
  id: string;
  item: string;
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
  onOptionUpdate?: (optionId: string, content: string) => void;
  onOptionsUpdate?: (questionId: string, options: Array<ChoiceItem>) => void;
  view?: boolean;
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

export type StepsStringPropsKeys = keyof StringPropsOnly<Step>;

// Property types
export enum QuestionsPropertiesFormKeys {
  NameContent = "NameContent",
  Required = "Required",
  Description = "Description",
  DescriptionContent = "DescriptionContent",
  Placeholder = "Placeholder",
  PlaceholderContent = "PlaceholderContent",
  Long = "Long",
  DateRestriction = "DateRestriction",
  DateRestrictionRule = "DateRestrictionRule",
  Multiple = "Multiple",
  Min = "Min",
  Max = "Max",
  Step = "Step",
  AllowDecimals = "AllowDecimals",
}

export enum StepsPropertiesFormKeys {
  Title = "Title",
  Description = "Description",
  Icon = "Icon"
}

export interface QuestionsPropertiesFormProps {
  [QuestionsPropertiesFormKeys.NameContent]: string | undefined;
  [QuestionsPropertiesFormKeys.Required]: boolean;
  [QuestionsPropertiesFormKeys.Description]: boolean;
  [QuestionsPropertiesFormKeys.DescriptionContent]: string | undefined;
  [QuestionsPropertiesFormKeys.Placeholder]: boolean;
  [QuestionsPropertiesFormKeys.PlaceholderContent]: string | undefined;
  [QuestionsPropertiesFormKeys.Long]: boolean;
  [QuestionsPropertiesFormKeys.DateRestriction]?: boolean;
  [QuestionsPropertiesFormKeys.DateRestrictionRule]: DateRestrictionRule;
  [QuestionsPropertiesFormKeys.Multiple]: boolean;
  [QuestionsPropertiesFormKeys.Min]: number | undefined;
  [QuestionsPropertiesFormKeys.Max]: number | undefined;
  [QuestionsPropertiesFormKeys.Step]: number | undefined;
  [QuestionsPropertiesFormKeys.AllowDecimals]?: boolean | undefined;
}


export interface StepsPropertiesFormProps {
  [StepsPropertiesFormKeys.Title]: string | undefined;
  [StepsPropertiesFormKeys.Description]: string | undefined;
  [StepsPropertiesFormKeys.Icon]: string | undefined;

}

export enum StepFormKeys {
  EnabledStep = "EnabledStep"
}

export interface StepFormProps {
  [StepFormKeys.EnabledStep]: boolean;

}


export enum PropertiesTypes {
  Switch = "Switch",
  Button = "Button",
  Text = "Text",
  Number = "Number",
  Combobox = "Combobox"
}

export type BasePropertiesRequiredProps<TFieldValues extends FieldValues> =
  | {
    name: Path<TFieldValues>;
    displayName?: string;
    type: PropertiesTypes.Switch;
    control: Control<TFieldValues, boolean>;
    switchCheckedOnChange: (checked: boolean) => void;
    textField: true;
    textFieldOnChange: (e: string) => void;
    textFieldName: Path<TFieldValues>;
    textValidationRules?:
    | Omit<
      RegisterOptions<TFieldValues>,
      "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
    >
    | undefined;
    children?: ReactNode;
  }
  | {
    name: Path<TFieldValues>;
    displayName?: string;
    type: PropertiesTypes.Switch;
    control: Control<TFieldValues, boolean>;
    switchCheckedOnChange: (checked: boolean) => void;
    textField: false;
    children?: ReactNode;
  }
  | {
    name: Path<TFieldValues>;
    displayName?: string;
    type: PropertiesTypes.Switch;
    control: Control<TFieldValues, boolean>;
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
    type: PropertiesTypes.Text | PropertiesTypes.Number;
    control: Control<TFieldValues, any>;
    fieldOnChange: (e: string | number) => void;
    fieldName: Path<TFieldValues>;
    validationRules?:
    | Omit<
      RegisterOptions<TFieldValues>,
      "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
    >
    | undefined;
  }
  | {
    label: string;
    displayName?: string;
    items: Array<string>;
    type: PropertiesTypes.Combobox
    control: Control<TFieldValues, any>;
    fieldOnChange: (e: string) => void;
    fieldName: Path<TFieldValues>;

  };




export enum FormBuilderMode {
  Submission = "Submission",
  Designer = "Designer",
  View = "View",
}

type FormBuilderServiceSubmitProps = {
  id?: string;
  name: string | undefined;
  title: string | undefined;
  description: string | undefined;
  questions: Question[];
  enabledSteps: boolean;
  steps: Step[];
  initialValues: any;
  validationSchema: any;
  submitHandler: (questionsResponse: Question[]) => void;
  saveHandler?: (form: any) => void;
  mode: FormBuilderMode.Submission;
};

type FormBuilderServiceViewProps = {
  id?: string;
  name: string | undefined;
  title: string | undefined;
  description: string | undefined;
  questions: Question[];
  enabledSteps: boolean;
  steps: Step[];
  initialValues: any;
  validationSchema: any;
  submitHandler?: (questionsResponse: Question[]) => void;
  saveHandler?: (form: any) => void;
  mode: FormBuilderMode.View;
};

type FormBuilderDesignerProps = {
  id?: string;
  name: string | undefined;
  title: string | undefined;
  description: string | undefined;
  questions: Question[];
  enabledSteps: boolean;
  steps: Step[];
  initialValues: any;
  validationSchema: any;
  submitHandler?: (questionsResponse: Question[]) => void;
  saveHandler: (form: any) => void;
  mode: FormBuilderMode.Designer;
};

export type FormBuilderProps =
  | FormBuilderServiceSubmitProps
  | FormBuilderServiceViewProps
  | FormBuilderDesignerProps;
