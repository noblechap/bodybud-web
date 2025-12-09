import type { Supplement } from "~/types/client";

export function useSupplementsApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function createSupplement(clientId: number, payload: Omit<Supplement, "id" | "date">) {
    return $authenticatedApi<Supplement>(`/users/${clientId}/supplements/`, {
      method: "POST",
      body: payload,
    });
  }

  async function updateSupplement(clientId: number, supplementId: number, payload: Omit<Supplement, "date">) {
    return $authenticatedApi<Supplement>(`/users/${clientId}/supplements/${supplementId}/`, {
      method: "PUT",
      body: payload,
    });
  }

  async function deleteSupplement(clientId: number, supplementId: number) {
    return $authenticatedApi<void>(`/users/${clientId}/supplements/${supplementId}/`, {
      method: "DELETE",
    });
  }

  return {
    createSupplement,
    updateSupplement,
    deleteSupplement,
  };
}
