// stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const accessToken = ref(localStorage.getItem("accessToken") || null);
  const refreshToken = ref(localStorage.getItem("refreshToken") || null);
  const isAuthenticated = computed(() => !!accessToken.value);

  // Configure axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to attach token
  api.interceptors.request.use(
    (config) => {
      if (accessToken.value) {
        config.headers.Authorization = `Bearer ${accessToken.value}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { access } = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  /**
   * Logs in a user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise} Axios response
   */
  const login = async (email, password) => {
    try {
      const response = await api.post("/login/", {
        email,
        password,
      });

      // Update state
      accessToken.value = response.data.access;
      refreshToken.value = response.data.refresh;
      user.value = {
        id: response.data.userId,
        username: response.data.username,
        email: email,
        isAdmin: response.data.adminStatus,
      };

      // Persist to localStorage
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(user.value));

      return response.data;
    } catch (error) {
      let errorMessage = "Login failed";
      if (error.response) {
        errorMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          errorMessage;
      }
      throw new Error(errorMessage);
    }
  };

  /**
   * Refreshes the access token using the refresh token
   * @returns {Promise} New tokens
   */
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) throw new Error("No refresh token available");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh/`,
        { refresh: refreshToken.value },
      );

      accessToken.value = response.data.access;
      localStorage.setItem("accessToken", response.data.access);

      // If backend returns new refresh token (optional)
      if (response.data.refresh) {
        refreshToken.value = response.data.refresh;
        localStorage.setItem("refreshToken", response.data.refresh);
      }

      return response.data;
    } catch (error) {
      logout();
      throw new Error("Session expired. Please login again.");
    }
  };

  /**
   * Logs out the current user
   */
  const logout = () => {
    // Clear state
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  /**
   * Initializes the auth state from localStorage
   */
  const initialize = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  };

  // Initialize when store is created
  initialize();

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,

    // Actions
    login,
    logout,
    refreshAccessToken,

    // Expose the configured axios instance
    api,
  };
});
