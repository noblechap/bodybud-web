import type { FoodGoals, MealPlan, UpdateMealPlanPayload } from "~/types/food";
import type { ClientInfo } from "~/types/models";

export function useClientApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function fetchClientById(clientId: string | number) {
    return $authenticatedApi<ClientInfo>(`/coaching/clients/${clientId}/`);
  }

  async function removeClient(clientId: string | number) {
    return $authenticatedApi(`/coaching/clients/${clientId}/`, {
      method: "DELETE",
    });
  }

  async function updateClientMealPlan(clientId: string | number, payload: UpdateMealPlanPayload) {
    return $authenticatedApi<{ meal_plan: MealPlan; food_goals: FoodGoals }>(`/coaching/clients/${clientId}/update-nutrition-plan/`, {
      method: "PATCH",
      body: payload,
    });
  }

  return {
    fetchClientById,
    removeClient,
    updateClientMealPlan,
  };
}
