

export enum Status {
   Active = "Active",
   Inactive = "Inactive"
}

export enum FormTableKeys {
  name = "name",
  lastUpdated = "lastUpdated",
  created = "created",
  status = "status",
  actions = "actions"
}


export type FormTable = {
    name: string
    lastUpdated: Date
    created: Date
    status: keyof typeof Status
}

