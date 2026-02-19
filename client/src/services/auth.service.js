import { apiRequest } from "../lib/api";

const AUTH_URL = "/api/auth";

export const authService = {
  login: async (email, password) => {
    const data = await apiRequest(`${AUTH_URL}/login`, "POST", {
      email,
      password,
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    return await apiRequest(`${AUTH_URL}/register`, "POST", userData);
  },

  verifyOtp: async (email, otp) => {
    const data = await apiRequest(`${AUTH_URL}/verify-otp`, "POST", {
      email,
      otp,
    });
    return data;
  },

  sendResetOtp: async (email) => {
    return await apiRequest(`${AUTH_URL}/send-reset-otp`, "POST", { email });
  },

  resetPassword: async (email, otp, newPassword) => {
    return await apiRequest(`${AUTH_URL}/reset-password`, "POST", {
      email,
      otp,
      newPassword,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getProfile: async () => {
    return await apiRequest(`${AUTH_URL}/profile`, "GET");
  },

  updateProfile: async (userData) => {
    const data = await apiRequest(`${AUTH_URL}/profile`, "PUT", userData);
    // Update local storage if user data changes
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },
};
