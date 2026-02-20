import { apiRequest } from "../lib/api";

const ITEMS_URL = "/api/items";

export const itemsService = {
  getItems: async (filters = {}) => {
    // Convert filters to query string if needed
    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== "All") {
      queryParams.append("category", filters.category);
    }
    if (filters.search) {
      queryParams.append("search", filters.search);
    }
    const queryString = queryParams.toString();
    const url = queryString ? `${ITEMS_URL}?${queryString}` : ITEMS_URL;

    return await apiRequest(url, "GET");
  },

  getItemById: async (id) => {
    return await apiRequest(`${ITEMS_URL}/${id}`, "GET");
  },

  createItem: async (itemData) => {
    // When sending FormData, we don't set Content-Type header manually
    // The browser sets it with the correct boundary
    return await apiRequest(`${ITEMS_URL}`, "POST", itemData);
  },

  getMyListings: async () => {
    return await apiRequest(`${ITEMS_URL}/user/my-listings`, "GET");
  },

  updateItem: async (id, itemData) => {
    return await apiRequest(`${ITEMS_URL}/${id}`, "PUT", itemData);
  },

  deleteItem: async (id) => {
    return await apiRequest(`${ITEMS_URL}/${id}`, "DELETE");
  },
};
