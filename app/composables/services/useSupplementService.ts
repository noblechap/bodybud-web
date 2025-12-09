import type { Supplement } from "~/types/client";
import { useSupplementsApi } from "~/composables/api/supplements/useSupplementsApi";
import { useClientStore } from "~/store/clientStore";

export function useSupplementService() {
  const supplementsApi = useSupplementsApi();
  const clientStore = useClientStore();
  const toast = useToast();

  async function addSupplement(payload: Omit<Supplement, "id" | "date">): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      const newSupplement = await supplementsApi.createSupplement(clientStore.clientId, payload);
      clientStore.addSupplement(newSupplement);
      toast.success("Supplement added successfully!");
    }
    catch (error) {
      toast.error("Failed to add supplement");
      throw error;
    }
  }

  async function updateSupplement(supplement: Supplement): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      const updatedSupplement = await supplementsApi.updateSupplement(
        clientStore.clientId,
        supplement.id,
        supplement,
      );
      clientStore.updateSupplement(updatedSupplement);
      toast.success("Supplement updated successfully!");
    }
    catch (error) {
      toast.error("Failed to update supplement");
      throw error;
    }
  }

  async function deleteSupplement(supplementId: number): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      await supplementsApi.deleteSupplement(clientStore.clientId, supplementId);
      clientStore.deleteSupplement(supplementId);
      toast.success("Supplement deleted successfully!");
    }
    catch (error) {
      toast.error("Failed to delete supplement");
      throw error;
    }
  }

  return {
    addSupplement,
    updateSupplement,
    deleteSupplement,
  };
}
