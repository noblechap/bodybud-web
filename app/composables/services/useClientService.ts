import type { FoodGoals, UpdateMealPlanPayload } from "~/types/food";
import type { ClientInfo } from "~/types/models";
import { useClientApi } from "~/composables/api/coaching/useClientApi";
import { useClientStore } from "~/store/clientStore";
import { useCoachingStore } from "~/store/coachingStore";

export function useClientService() {
  const clientApi = useClientApi();
  const coachingStore = useCoachingStore();
  const clientStore = useClientStore();
  const { showLoading, hideLoading } = useGlobalLoading();
  const toast = useToast();
  const router = useRouter();

  async function loadClientData(clientId: string | number): Promise<ClientInfo | null> {
    try {
      showLoading("Loading client data...");
      const data = await clientApi.fetchClientById(clientId);

      // Update client store with setter
      clientStore.setClientData({
        id: Number(clientId),
        username: data.username,
        using_pounds: data.using_pounds,
        workout_history: (data.workout_history || []) as typeof clientStore.workout_history,
        workout_templates: (data.workout_templates || []) as typeof clientStore.workout_templates,
        supplements: (data.supplements || []) as typeof clientStore.supplements,
        bodyweights: (data.bodyweights || []) as typeof clientStore.bodyweights,
        food_goals: (data.food_goals?.[0]) || ({} as FoodGoals),
        meal_plan: (data.meal_plan?.[0]) || undefined,
        client_checkins: (data.client_checkins || []) as typeof clientStore.client_checkins,
      });

      return data;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to load client data";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function deleteClient(clientId: string | number) {
    try {
      showLoading("Removing client...");
      await clientApi.removeClient(clientId);

      // Remove from coaching store
      const index = coachingStore.clients.findIndex(
        (client) => client.id === Number(clientId),
      );
      if (index !== -1) {
        coachingStore.clients.splice(index, 1);
      }

      // Reset client store
      clientStore.resetClientData();

      toast.success("Client removed successfully");
      router.push("/coaching");
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete client";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function updateMealPlan(clientId: number, payload: UpdateMealPlanPayload) {
    try {
      showLoading("Updating meal plan...");
      const response = await clientApi.updateClientMealPlan(clientId, payload);

      // Update client store with setter
      clientStore.setMealPlan({
        food_goals: response.food_goals,
        meal_plan: response.meal_plan,
      });

      toast.success("Meal plan updated successfully");
      return response;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to update meal plan";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  return {
    loadClientData,
    deleteClient,
    updateMealPlan,
  };
}
