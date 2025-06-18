import { Message } from "@/services/common";
import { Form, NewForm } from "@/components/formsTable/types";
import { apiEndpoint, commonHeaders } from "./common";

const middlewareErrorHandler = async (callback: any) => {
  try {
    await callback();
  } catch (error) {
    console.log();
  }
};

const createForm = async (params: any): Promise<NewForm | Message> => {
  const form = await (
    await fetch(`${apiEndpoint}/form`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(params),
      credentials: "include",
    })
  ).json();
  return form;
};

const getForm = async (formId: string): Promise<Form | Message> => {
  const form = await (
    await fetch(`${apiEndpoint}/form/${formId}`, {
      method: "GET",
      headers: commonHeaders,
      credentials: "include",
    })
  ).json();
  return form;
};

const deleteForm = async (formId: string): Promise<Message> => {
  const response = await fetch(`${apiEndpoint}/form/${formId}`, {
    method: "DELETE",
    headers: commonHeaders,
    credentials: "include",
  });

  return {
    message: "",
    statusCode: response.status,
  };
};

const saveForm = async (form: any): Promise<Message> => {
  const response = await fetch(`${apiEndpoint}/form/${form.id}`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(form),
    credentials: "include",
  });

  if (response.status === 200) {
    return {
      message: "",
      statusCode: response.status,
    };
  } else {
    return await response.json();
  }
};

const getAllForms = async (): Promise<Form[]> => {
  const forms = await (
    await fetch(`${apiEndpoint}/form`, {
      method: "GET",
      headers: commonHeaders,
      credentials: "include",
    })
  ).json();
  return forms;
};

const services = {
  createForm,
  saveForm,
  getForm,
  deleteForm,
  getAllForms,
};

export default services;
