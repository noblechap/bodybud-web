import type {
  AddClientPayload,
  AssignCheckInPayload,
  MealTemplate,
  SaveCheckInTemplatePayload,
  UpdateClientPayload,
} from "~/types/models";
import { useCoachingApi } from "~/composables/api/coaching/useCoachingApi";
import { useCoachingStore } from "~/store/coachingStore";

export function useCoachingService() {
  const coachingStore = useCoachingStore();
  const coachingApi = useCoachingApi();
  const { showLoading, hideLoading } = useGlobalLoading();
  const toast = useToast();

  async function fetchClients() {
    try {
      showLoading("Loading clients...");
      const data = await coachingApi.fetchClients();
      coachingStore.clients = data || [];
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to fetch clients";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function fetchMeals() {
    try {
      showLoading("Loading meals...");
      const data = await coachingApi.fetchMeals();
      coachingStore.meals = data || [];
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to fetch meals";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function fetchCheckInTemplates() {
    try {
      showLoading("Loading check-in templates...");
      const data = await coachingApi.fetchCheckInTemplates();
      coachingStore.checkInTemplates = data || [];
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to fetch check-in templates";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function createMeal(payload: { name: string; meal_foods: Array<{ food: number; serving_size_g: number }> }): Promise<MealTemplate> {
    try {
      showLoading("Creating meal template...");
      const newMeal = await coachingApi.createMealTemplate(payload);
      coachingStore.meals.push(newMeal);
      toast.success("Meal template created successfully");
      return newMeal;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to create meal";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function deleteMeal(userId: number, mealId: number): Promise<void> {
    try {
      showLoading("Deleting meal template...");
      await coachingApi.deleteMealTemplate(userId, mealId);

      const mealIndex = coachingStore.meals.findIndex((meal) => meal.id === mealId);
      if (mealIndex !== -1) {
        coachingStore.meals.splice(mealIndex, 1);
      }

      toast.success("Meal template deleted successfully");
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete meal";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function addClient(payload: AddClientPayload) {
    try {
      coachingStore.isAddingClient = true;
      await coachingApi.addClient(payload);
      await fetchClients();
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to add client";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      coachingStore.isAddingClient = false;
    }
  }

  async function assignCheckIn(payload: AssignCheckInPayload) {
    try {
      await coachingApi.assignCheckIn(payload);
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to assign check-in";
      toast.error(errorMsg);
      throw error;
    }
  }

  async function saveCheckInTemplate(payload: SaveCheckInTemplatePayload) {
    try {
      const data = await coachingApi.saveCheckInTemplate(payload);
      await fetchCheckInTemplates();
      return data;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to save check-in template";
      toast.error(errorMsg);
      throw error;
    }
  }

  async function deleteCheckInTemplate(templateId: number) {
    try {
      await coachingApi.deleteCheckInTemplate(templateId);
      await fetchCheckInTemplates();
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete check-in template";
      toast.error(errorMsg);
      throw error;
    }
  }

  async function updateClient(clientId: number, payload: UpdateClientPayload) {
    try {
      showLoading("Updating client information...");
      const updatedClient = await coachingApi.updateClient(clientId, payload);

      // Update the client in the store
      const index = coachingStore.clients.findIndex((c) => c.id === clientId);
      if (index !== -1) {
        coachingStore.clients[index] = updatedClient;
      }

      toast.success("Client information updated successfully");
      return updatedClient;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to update client";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function loadInitialData() {
    try {
      showLoading("Loading coaching data...");
      await Promise.all([
        fetchClients(),
        fetchMeals(),
        fetchCheckInTemplates(),
      ]);
    }
    finally {
      hideLoading();
    }
  }

  return {
    fetchClients,
    fetchMeals,
    fetchCheckInTemplates,
    createMeal,
    deleteMeal,
    addClient,
    updateClient,
    assignCheckIn,
    saveCheckInTemplate,
    deleteCheckInTemplate,
    loadInitialData,
  };
}
