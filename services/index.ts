import { services as adminServices } from "./admin";
import { services as formServies } from "./form";
import { services as userServices } from "./user";

export const services = {
  ...adminServices,
  ...formServies,
  ...userServices,
};
