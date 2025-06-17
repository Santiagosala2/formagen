const apiEndpoint = "http://localhost:5081/api";
const commonHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

export type Message = {
  statusCode: number;
  message: string;
};

export { apiEndpoint, commonHeaders };
