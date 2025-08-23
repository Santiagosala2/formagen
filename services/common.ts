const apiEndpoint = `${process.env.API_ENDPOINT}/api`;
const commonHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

export type Message = {
  statusCode: number;
  message: string;
};

export { apiEndpoint, commonHeaders };
