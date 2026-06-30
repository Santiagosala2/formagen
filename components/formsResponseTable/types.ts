import { Question, Step, StepsSettings } from "../formBuilder/types";

export type SharedUser = {
  id: string;
  name: string;
  email: string;
};

export type FormResponse = {
  id: string;
  title?: string;
  description?: string;
  formId: string;
  user: SharedUser;
  questions: Question[];
  steps: Step[]
  enabledSteps: boolean;
  stepsSettings: StepsSettings;
  created?: Date;
};

export enum FormResponseTableKeys {
  user = "user",
  created = "created",
}
