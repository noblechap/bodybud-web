import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

export const useExerciseStore = defineStore("exercise", () => {
  // State
  const exercises = ref([]);
  const isLoading = ref(false);

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
   * Fetch all exercises from API
   */
  const fetchExercises = async () => {
    try {
      isLoading.value = true;
      const [userExercisesResponse, exercisesResponse] = await Promise.all([
        api.get(`/users/${authStore.user.id}/exercises/`),
        api.get("/exercises/"),
      ]);

      const userExercises = userExercisesResponse.data;
      const allExercises = exercisesResponse.data;

      // Combine both arrays and remove duplicates by id
      const uniqueExercises = [...userExercises, ...allExercises].reduce(
        (acc, current) => {
          const x = acc.find((item) => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        [],
      );

      exercises.value = uniqueExercises;
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Save new exercise
   * @param {Object} exerciseData - Exercise data to save
   */
  const saveExercise = async (exerciseData) => {
    try {
      isLoading.value = true;
      const response = await api.post("/exercises/", exerciseData);
      exercises.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to save exercise:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    exercises,
    isLoading,

    // Actions
    fetchExercises,
    saveExercise,
  };
});
