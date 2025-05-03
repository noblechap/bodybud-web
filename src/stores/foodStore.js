// stores/food.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

export const useFoodStore = defineStore("food", () => {
  // State
  const userFoods = ref(JSON.parse(localStorage.getItem("userFoods")) || []);
  const searchResults = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Get auth store
  const authStore = useAuthStore();

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
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  /**
   * Search foods from API
   * @param {string} query - Search term
   * @returns {Promise} - Array of food items
   */
  const searchFoods = async (name) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Encode the name for URL safety
      const encodedName = encodeURIComponent(name);
      const response = await api.get(`/foods/${encodedName}/`);

      searchResults.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to search foods";
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Add food to user's collection
   * @param {Object} food - Food item to add
   * @returns {Promise} - Updated food item
   */
  const saveFood = async (food) => {
    try {
      // Add to backend
      const response = await api.post("/foods/", food);
      const newFood = response.data;

      // Update local state
      userFoods.value = [...userFoods.value, newFood];
      localStorage.setItem("userFoods", JSON.stringify(userFoods.value));

      return newFood;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to add food";
      throw error.value;
    }
  };

  /**
   * Load user's foods from API
   */
  const loadUserFoods = async () => {
    try {
      isLoading.value = true;
      const response = await api.get(`/users/${authStore.user.id}/foods/`);
      userFoods.value = response.data;
      localStorage.setItem("userFoods", JSON.stringify(userFoods.value));
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load foods";
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize - load user's foods when store is created
  if (authStore.isAuthenticated) {
    loadUserFoods();
  }

  // Getters
  const hasFoods = computed(() => userFoods.value.length > 0);

  return {
    // State
    userFoods,
    searchResults,
    isLoading,
    error,

    // Getters
    hasFoods,

    // Actions
    searchFoods,
    saveFood,
    loadUserFoods,
  };
});
