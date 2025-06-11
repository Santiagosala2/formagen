import { apiEndpoint, commonHeaders } from "./common";

const sendOTP = async (email: string): Promise<boolean> => {
  const form = await (
    await fetch(`${apiEndpoint}/api/admin/otp`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ userEmail: email }),
    })
  ).json();
  return form;
};

const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const form = await (
    await fetch(`${apiEndpoint}/api/admin/verifyOtp`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    })
  ).json();
  return form;
};

const services = {
  admin: {
    verifyOTP,
    sendOTP,
  },
};

export default services;
