import { Question } from "../formBuilder/types";

export enum Status {
  Active = "Active",
  Inactive = "Inactive",
}

export enum FormTableKeys {
  name = "name",
  lastUpdated = "lastUpdated",
  created = "created",
  status = "status",
  actions = "actions",
}

export type ErrorMessage = {
  status: number;
  message: string;
};

export type Form = {
  name: string;
  title?: string;
  description?: string;
  questions: Array<Question>;
  lastUpdate: Date;
  status: number;
  created: Date;
};

export type FormTable = {
  name: string;
  lastUpdated: Date;
  created: Date;
  status: keyof typeof Status;
};

export type NewForm = {
  id: string;
  name: string;
};
