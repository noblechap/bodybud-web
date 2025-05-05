import axios from "axios";
import { useAuthStore } from "../stores/auth";

const apiCoach = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiCoach.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// Export each function individually
export async function addNewClient(clientData) {
  try {
    const response = await apiCoach.post("/coaching/clients/add/", clientData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createMealTemplate(mealData) {
  try {
    const response = await apiCoach.post("/coaching/create-meal/", mealData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteCoachMeal(userId, mealId) {
  try {
    const response = await apiCoach.delete(`/users/${userId}/meals/${mealId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchCoachMeals() {
  try {
    const response = await apiCoach.get("/coaching/meal-templates/");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchCoachClients() {
  try {
    const response = await apiCoach.get("/coaching/clients/");
    return response.data;
  } catch (error) {
    throw error;
  }
}
