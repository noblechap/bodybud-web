import type { CheckInTemplate, Client, MealTemplate } from "~/types/models";
import { defineStore } from "pinia";

export const useCoachingStore = defineStore("coaching", () => {
  // State
  const clients = ref<Client[]>([]);
  const planTier = ref<string | null>(null);
  const maxClientProvisions = ref<number | null>(null);
  const provisionedClients = ref<number | null>(null);
  const meals = ref<MealTemplate[]>([]);
  const checkInTemplates = ref<CheckInTemplate[]>([]);
  const isAddingClient = ref(false);

  return {
    // State
    clients,
    meals,
    checkInTemplates,
    isAddingClient,
    planTier,
    maxClientProvisions,
    provisionedClients,
  };
});
