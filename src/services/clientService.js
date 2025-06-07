import axios from "axios";
import { useAuthStore } from "../stores/auth";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

export async function getClientById(id) {
  try {
    const response = await apiClient.get(`/coaching/clients/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteClient(clientId) {
  try {
    const response = await apiClient.delete(`/coaching/clients/${clientId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateNutritionPlan(id, payload) {
  try {
    const response = await apiClient.patch(
      `/coaching/clients/${id}/update-nutrition-plan/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createWorkoutCategory(clientId, payload) {
  try {
    const response = await apiClient.post(
      `/users/${clientId}/workout-categories/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteWorkoutCategory(clientId, categoryId) {
  try {
    const response = await apiClient.delete(
      `/users/${clientId}/workout-categories/${categoryId}/`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createWorkoutTemplate(userId, payload) {
  try {
    const response = await apiClient.post(
      `/users/${userId}/workouts/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function addNewSupplement(userId, payload) {
  try {
    const response = await apiClient.post(
      `/users/${userId}/supplements/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateExistingSupplement(userId, payload) {
  try {
    const response = await apiClient.put(
      `/users/${userId}/supplements/${payload.id}/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteExistingSupplement(userId, id) {
  try {
    const response = await apiClient.delete(
      `/users/${userId}/supplements/${id}/`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateWorkoutTemplate(userId, workoutId, payload) {
  try {
    const response = await apiClient.put(
      `/users/${userId}/workouts/${workoutId}/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteWorkoutTemplate(userId, workoutId) {
  try {
    const response = await apiClient.delete(
      `/users/${userId}/workouts/${workoutId}/`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function signalChanges(clientId) {
  try {
    const response = await apiClient.patch(
      `/coaching/signal-changes/${clientId}/`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function assignClientCheckIn(payload) {
  try {
    const response = await apiClient.post(
      `/coaching/clients/${payload.client}/assign-checkin/`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCheckinById(id) {
  try {
    const response = await apiClient.get(`/coaching/checkins/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchClientSteps(clientId) {
  try {
    const response = await apiClient.get(
      `/users/${clientId}/activity-summary/`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
