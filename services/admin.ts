import { AddAminUser, AdminUser } from "@/components/adminUsersTable/types";
import { apiEndpoint, commonHeaders, Message } from "./common";

const sendOTP = async (email: string): Promise<boolean> => {
  const form = await (
    await fetch(`${apiEndpoint}/admin/otp`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ email: email }),
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

const getSession = async (): Promise<{ email: string } | Message> => {
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

const createUser = async (
  newUserPaylod: AddAminUser
): Promise<AdminUser | Message> => {
  const newUser = await (
    await fetch(`${apiEndpoint}/admin/user`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(newUserPaylod),
      credentials: "include",
    })
  ).json();
  return newUser;
};

const getAllUsers = async (): Promise<AdminUser[]> => {
  const allUsers = await (
    await fetch(`${apiEndpoint}/admin/users`, {
      method: "GET",
      headers: commonHeaders,
      credentials: "include",
    })
  ).json();
  return allUsers;
};

const deleteUser = async (userId: string): Promise<Message> => {
  const response = await fetch(`${apiEndpoint}/admin/user/${userId}`, {
    method: "DELETE",
    headers: commonHeaders,
    credentials: "include",
  });

  return {
    message: "",
    statusCode: response.status,
  };
};

const saveUser = async (user: any): Promise<Message> => {
  const response = await fetch(`${apiEndpoint}/admin/updateUser`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(user),
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

const services = {
  admin: {
    verifyOTP,
    sendOTP,
    getSession,
    createUser,
    saveUser,
    deleteUser,
    getAllUsers,
  },
};

export default services;
