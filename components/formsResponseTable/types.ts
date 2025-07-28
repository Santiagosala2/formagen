import { Question } from "../formBuilder/types";

export type SharedUser = {
  id: string;
  name: string;
  email: string;
};

export type FormResponse = {
  id: string;
  formId: string;
  user: SharedUser;
  question: Question[];
  created?: Date;
};
