import { Question } from "../formBuilder/types";

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
  created?: Date;
};

export enum FormResponseTableKeys {
  user = "user",
  created = "created",
}
