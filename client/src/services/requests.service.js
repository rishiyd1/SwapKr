import { apiRequest } from "../lib/api";

const REQUESTS_URL = "/api/requests";

export const requestsService = {
  createRequest: async (requestData) => {
    return await apiRequest(`${REQUESTS_URL}`, "POST", requestData);
  },

  getRequests: async () => {
    return await apiRequest(`${REQUESTS_URL}`, "GET");
  },

  getMyRequests: async () => {
    return await apiRequest(`${REQUESTS_URL}/my-requests`, "GET");
  },
};
