import { z } from "zod";
import { AddUserSchema } from "./usersTable";

export enum UserTableKeys {
  name = "name",
  email = "email",
  status = "status",
  actions = "actions",
}

export type User = {
  id?: string;
  name: string;
  email: string;
  lastUpdated?: Date;
  created?: Date;
};

export type AddUser = z.infer<typeof AddUserSchema>;
