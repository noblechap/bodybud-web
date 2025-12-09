import type { Food } from "~/types/food";

export function useFoodApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function fetchUserFoods(userId: number) {
    return $authenticatedApi<Food[]>(`/users/${userId}/foods/`);
  }

  async function searchFoods(query: string) {
    const encodedQuery = encodeURIComponent(query);
    return $authenticatedApi<Food[]>(`/foods/${encodedQuery}/`);
  }

  async function createFood(payload: Partial<Food>) {
    return $authenticatedApi<Food>("/foods/", {
      method: "POST",
      body: payload,
    });
  }

  async function updateFood(foodId: number, payload: Partial<Food>) {
    return $authenticatedApi<Food>(`/foods/${foodId}/`, {
      method: "PATCH",
      body: payload,
    });
  }

  async function deleteFood(foodId: number) {
    return $authenticatedApi(`/foods/${foodId}/unsave/`, {
      method: "DELETE",
    });
  }

  return {
    fetchUserFoods,
    searchFoods,
    createFood,
    updateFood,
    deleteFood,
  };
}
