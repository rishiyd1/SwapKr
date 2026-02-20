import { apiRequest } from "../lib/api";

const REQUESTS_URL = "/api/requests";

export const requestsService = {
  createRequest: async (requestData) => {
    return await apiRequest(`${REQUESTS_URL}`, "POST", requestData);
  },

  getRequests: async ({ category } = {}) => {
    let url = `${REQUESTS_URL}`;
    if (category && category !== "All") {
      url += `?category=${encodeURIComponent(category)}`;
    }
    return await apiRequest(url, "GET");
  },

  getMyRequests: async () => {
    return await apiRequest(`${REQUESTS_URL}/my-requests`, "GET");
  },

  getRequestById: async (id) => {
    return await apiRequest(`${REQUESTS_URL}/${id}`, "GET");
  },

  updateRequest: async (id, requestData) => {
    return await apiRequest(`${REQUESTS_URL}/${id}`, "PUT", requestData);
  },

  deleteRequest: async (id) => {
    return await apiRequest(`${REQUESTS_URL}/${id}`, "DELETE");
  },
};
