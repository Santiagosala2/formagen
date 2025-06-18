import { format } from "date-fns";

const captializeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
const formatToAEST = (date: Date) => format(date, "dd/MM/yyyy");

export { captializeFirst, formatToAEST };
