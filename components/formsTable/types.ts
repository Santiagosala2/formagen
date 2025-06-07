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

export type Message = {
  statusCode: number;
  message: string;
};

export type Form = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  questions: Array<Question>;
  lastUpdated: Date;
  status: number;
  created: Date;
};

export type NewForm = {
  id: string;
  name: string;
};
