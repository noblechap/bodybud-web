import type { BodyWeight } from "~/types/client";

export function useBodyWeightApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function createBodyWeight(clientId: number, payload: Omit<BodyWeight, "id" | "date">) {
    return $authenticatedApi<BodyWeight>(`/users/${clientId}/body-weight/`, {
      method: "POST",
      body: payload,
    });
  }

  async function deleteBodyWeight(clientId: number, bodyWeightId: number) {
    return $authenticatedApi<void>(`/users/${clientId}/body-weight/${bodyWeightId}/`, {
      method: "DELETE",
    });
  }

  return {
    createBodyWeight,
    deleteBodyWeight,
  };
}
