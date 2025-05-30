import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import {
  addNewClient,
  fetchCoachClients,
  fetchCoachMeals,
  createMealTemplate,
  deleteCoachMeal,
  fetchCoachCheckInTemplates,
  saveNewCheckInTemplate,
  deleteTemplate,
} from "../services/coachService";

export const useCoachStore = defineStore("coach", () => {
  const meals = ref([]);
  const checkInTemplates = ref([]);
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

  function removeClient(clientId) {
    const index = clients.value.findIndex(
      (client) => client.id === Number(clientId),
    );
    if (index !== -1) {
      clients.value.splice(index, 1);
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

  async function fetchCheckInTemplates() {
    try {
      isLoading.value = true;
      const data = await fetchCoachCheckInTemplates();
      checkInTemplates.value = data || [];
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

  async function saveCheckInTemplate(payload) {
    try {
      const response = await saveNewCheckInTemplate(payload);
      checkInTemplates.value.push(response);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function deleteCheckInTemplate(id) {
    try {
      const response = await deleteTemplate(id);
      const templateIndex = checkInTemplates.value.findIndex(
        (template) => template.id === id,
      );
      if (templateIndex !== -1) {
        checkInTemplates.value.splice(templateIndex, 1);
      }
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
    checkInTemplates,
    fetchMeals,
    fetchClients,
    createMeal,
    addClient,
    deleteMeal,
    removeClient,
    fetchCheckInTemplates,
    saveCheckInTemplate,
    deleteCheckInTemplate,
  };
});
