import { ErrorMessage, Form, NewForm } from "@/components/formsTable/types";
import { parseJSON } from "date-fns";
import { json } from "stream/consumers";

const apiEndpoint = "http://localhost:5081/api";
const commonHeaders = {
  "Content-Type": "application/json",
};

const middlewareErrorHandler = async (callback: any) => {
  try {
    await callback();
  } catch (error) {
    console.log();
  }
};

const createForm = async (params: any): Promise<NewForm | ErrorMessage> => {
  const form = await (
    await fetch(`${apiEndpoint}/form`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(params),
    })
  ).json();
  return form;
};

const getForm = async (formId: string): Promise<Form | ErrorMessage> => {
  const form = await (
    await fetch(`${apiEndpoint}/form/${formId}`, {
      method: "GET",
      headers: commonHeaders,
    })
  ).json();
  return form;
};

const services = {
  createForm,
  getForm,
};

export default services;
