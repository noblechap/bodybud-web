import type { CheckInTemplate, Client, MealTemplate } from "~/types/models";
import { defineStore } from "pinia";

export const useCoachingStore = defineStore("coaching", () => {
  // State
  const clients = ref<Client[]>([]);
  const meals = ref<MealTemplate[]>([]);
  const checkInTemplates = ref<CheckInTemplate[]>([]);
  const isAddingClient = ref(false);

  return {
    // State
    clients,
    meals,
    checkInTemplates,
    isAddingClient,
  };
});
