import { z } from "zod";
import { AddUserSchema } from "./adminUsersTable";

export enum AdminUserTableKeys {
  name = "name",
  email = "email",
  status = "status",
  actions = "actions",
}

export type AdminUser = {
  id?: string;
  name: string;
  email: string;
  lastUpdated?: Date;
  created?: Date;
  isOwner?: boolean;
};

export type AddAminUser = z.infer<typeof AddUserSchema>;
