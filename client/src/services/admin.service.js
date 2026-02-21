import { apiRequest } from "../lib/api";

const ADMIN_URL = "/api/admin";

export const adminService = {
  // Items
  getPendingItems: async () => {
    return await apiRequest(`${ADMIN_URL}/pending-items`, "GET");
  },

  approveItem: async (id) => {
    return await apiRequest(`${ADMIN_URL}/items/${id}/approve`, "POST");
  },

  deleteItem: async (id) => {
    return await apiRequest(`${ADMIN_URL}/items/${id}`, "DELETE");
  },

  // Requests
  getPendingRequests: async () => {
    return await apiRequest(`${ADMIN_URL}/pending-requests`, "GET");
  },

  approveRequest: async (id) => {
    return await apiRequest(`${ADMIN_URL}/requests/${id}/approve`, "POST");
  },

  deleteRequest: async (id) => {
    return await apiRequest(`${ADMIN_URL}/requests/${id}`, "DELETE");
  },

  // Urgent Reviews
  getUrgentRequests: async () => {
    return await apiRequest(`${ADMIN_URL}/urgent-requests`, "GET");
  },

  // Users
  getAllUsers: async () => {
    return await apiRequest(`${ADMIN_URL}/users`, "GET");
  },

  deleteUser: async (id) => {
    return await apiRequest(`${ADMIN_URL}/users/${id}`, "DELETE");
  },
};
