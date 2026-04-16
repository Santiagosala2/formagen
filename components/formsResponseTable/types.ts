import { Question, Step } from "../formBuilder/types";

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
  enabledSteps: boolean
  created?: Date;
};

export enum FormResponseTableKeys {
  user = "user",
  created = "created",
}
