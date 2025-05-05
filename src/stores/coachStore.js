import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import {
  addNewClient,
  fetchCoachClients,
  fetchCoachMeals,
  createMealTemplate,
  deleteCoachMeal,
} from "../services/coachService";

export const useCoachStore = defineStore("coach", () => {
  const meals = ref([]);
  const clients = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();

  async function addClient(payload) {
    try {
      const response = await addNewClient(payload);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function fetchClients() {
    try {
      isLoading.value = true;
      const data = await fetchCoachClients();
      clients.value = data || [];
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMeals() {
    try {
      isLoading.value = true;
      const data = await fetchCoachMeals();
      meals.value = data || [];
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteMeal(mealId) {
    try {
      isLoading.value = true;
      await deleteCoachMeal(authStore.user.id, mealId);

      const mealIndex = meals.value.findIndex((meal) => meal.id === mealId);
      if (mealIndex !== -1) {
        meals.value.splice(mealIndex, 1);
      }
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createMeal(payload) {
    try {
      const response = await createMealTemplate(payload);
      fetchMeals();
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  return {
    clients,
    meals,
    isLoading,
    error,
    fetchMeals,
    fetchClients,
    createMeal,
    addClient,
    deleteMeal,
  };
});
