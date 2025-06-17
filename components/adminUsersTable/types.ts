export enum AdminUserTableKeys {
  name = "name",
  email = "email",
  status = "status",
  actions = "actions",
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  lastUpdated: Date;
  created: Date;
  isOwner: boolean;
};
