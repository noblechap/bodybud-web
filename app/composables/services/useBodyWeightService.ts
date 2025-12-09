import type { BodyWeight } from "~/types/client";
import { useBodyWeightApi } from "~/composables/api/bodyweight/useBodyWeightApi";
import { useClientStore } from "~/store/clientStore";

export function useBodyWeightService() {
  const bodyWeightApi = useBodyWeightApi();
  const clientStore = useClientStore();
  const toast = useToast();

  async function addBodyWeight(payload: Omit<BodyWeight, "id" | "date">): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      const newBodyWeight = await bodyWeightApi.createBodyWeight(clientStore.clientId, payload);
      clientStore.addBodyWeight(newBodyWeight);
      toast.success("Body weight added successfully!");
    }
    catch (error) {
      toast.error("Failed to add body weight");
      throw error;
    }
  }

  async function deleteBodyWeight(bodyWeightId: number): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      await bodyWeightApi.deleteBodyWeight(clientStore.clientId, bodyWeightId);
      clientStore.deleteBodyWeight(bodyWeightId);
      toast.success("Body weight deleted successfully!");
    }
    catch (error) {
      toast.error("Failed to delete body weight");
      throw error;
    }
  }

  return {
    addBodyWeight,
    deleteBodyWeight,
  };
}
