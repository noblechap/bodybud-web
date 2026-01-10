import type {
  AddClientPayload,
  AssignCheckInPayload,
  CheckInTemplate,
  CheckIn,
  Client,
  MealTemplate,
  SaveCheckInTemplatePayload,
  UpdateClientPayload,
  CreateClientAccountPayload,
  CreateClientAccountResponse,
  CoachInfo,
} from "~/types/models";

export function useCoachingApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function fetchClients() {
    return $authenticatedApi<CoachInfo>("/coaching/clients/");
  }

  async function addClient(payload: AddClientPayload) {
    return $authenticatedApi<Client>("/coaching/clients/add/", {
      method: "POST",
      body: payload,
    });
  }

  async function createClientAccount(payload: CreateClientAccountPayload) {
    return $authenticatedApi<CreateClientAccountResponse>("/register/", {
        method: "POST",
        body: payload,
      }
    );
  }

  async function fetchMeals() {
    return $authenticatedApi<MealTemplate[]>("/coaching/meal-templates/");
  }

  async function fetchCheckInTemplates() {
    return $authenticatedApi<CheckInTemplate[]>("/coaching/checkin-templates/");
  }

  async function fetchCheckInById(checkinId: number) {
    return $authenticatedApi<CheckIn>(`/coaching/checkins/${checkinId}/`);
  }

  async function assignCheckIn(payload: AssignCheckInPayload) {
    return $authenticatedApi(`/coaching/clients/${payload.client}/assign-checkin/`, {
      method: "POST",
      body: payload,
    });
  }

  async function saveCheckInTemplate(payload: SaveCheckInTemplatePayload) {
    return $authenticatedApi<CheckInTemplate>("/coaching/checkin-template/", {
      method: "POST",
      body: payload,
    });
  }

  async function deleteCheckInTemplate(templateId: number) {
    return $authenticatedApi(`/coaching/checkin-templates/${templateId}/`, {
      method: "DELETE",
    });
  }

  async function createMealTemplate(payload: { name: string; meal_foods: Array<{ food: number; serving_size_g: number }> }) {
    return $authenticatedApi<MealTemplate>("/coaching/create-meal/", {
      method: "POST",
      body: payload,
    });
  }

  async function deleteMealTemplate(userId: number, mealId: number) {
    return $authenticatedApi(`/users/${userId}/meals/${mealId}/`, {
      method: "DELETE",
    });
  }

  async function updateClient(clientId: number, payload: UpdateClientPayload) {
    return $authenticatedApi<Client>(`/coaching/clients/${clientId}/`, {
      method: "PATCH",
      body: payload,
    });
  }

  return {
    fetchClients,
    addClient,
    updateClient,
    fetchMeals,
    fetchCheckInTemplates,
    fetchCheckInById,
    assignCheckIn,
    saveCheckInTemplate,
    deleteCheckInTemplate,
    createMealTemplate,
    deleteMealTemplate,
    createClientAccount,
  };
}
