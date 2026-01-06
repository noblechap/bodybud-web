import type { ExerciseProgression, ExerciseProgressionPayload } from "~/types/client";
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

  async function fetchClientExerciseProgression(
    clientId: string | number, 
    exerciseId: number, 
    payload: ExerciseProgressionPayload
  ) {
    return $authenticatedApi<ExerciseProgression[]>(
      `/users/${clientId}/exercises/${exerciseId}/best-sets/`,
      {
        method: "GET",
        params: payload,
      }
    );
  }

  async function signalChanges(clientId: string | number) {
    return $authenticatedApi(`/coaching/signal-changes/${clientId}/`, {
      method: "PATCH",
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
    fetchClientExerciseProgression,
    signalChanges,
  };
}
