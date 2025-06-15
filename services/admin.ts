import { Message, Form, NewForm } from "@/components/formsTable/types";
import { apiEndpoint, commonHeaders } from "./common";

export type AdminUser = {
  email: string;
};

const sendOTP = async (email: string): Promise<boolean> => {
  const form = await (
    await fetch(`${apiEndpoint}/admin/otp`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ userEmail: email }),
    })
  ).json();
  return form;
};

const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const form = await (
    await fetch(`${apiEndpoint}/admin/verifyOtp`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
      credentials: "include",
    })
  ).json();
  return form;
};

const getSession = async (): Promise<AdminUser | Message> => {
  const session = await fetch(`${apiEndpoint}/admin/user`, {
    method: "GET",
    headers: commonHeaders,
    credentials: "include",
  });

  if (session.status === 401) {
    const message: Message = {
      message: "",
      statusCode: session.status,
    };
    return message;
  } else {
    return await session.json();
  }
};

const services = {
  admin: {
    verifyOTP,
    sendOTP,
    getSession,
  },
};

export default services;
