import type { Food } from "~/types/food";
import { useFoodApi } from "~/composables/api/nutrition/useFoodApi";
import { useAuthStore } from "~/store/authStore";
import { useFoodStore } from "~/store/foodStore";

export function useFoodService() {
  const foodApi = useFoodApi();
  const foodStore = useFoodStore();
  const toast = useToast();
  const { showLoading, hideLoading } = useGlobalLoading();

  async function loadUserFoods(): Promise<Food[]> {
    try {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        throw new Error("User not authenticated");
      }
      showLoading("Loading foods...");
      const foods = await foodApi.fetchUserFoods(Number(authStore.user.id));
      foodStore.setUserFoods(foods);
      return foods;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to load foods";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function searchFoods(query: string): Promise<Food[]> {
    try {
      showLoading("Searching foods...");
      const results = await foodApi.searchFoods(query);
      foodStore.setSearchResults(results);
      return results;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to search foods";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function saveFood(foodData: Partial<Food>): Promise<Food> {
    try {
      showLoading("Saving food...");
      const newFood = await foodApi.createFood(foodData);
      foodStore.addUserFood(newFood);
      toast.success("Food created successfully");
      return newFood;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to create food";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function updateFood(foodId: number, foodData: Partial<Food>): Promise<Food> {
    try {
      showLoading("Updating food...");
      const updatedFood = await foodApi.updateFood(foodId, foodData);
      foodStore.updateUserFood(foodId, updatedFood);
      toast.success("Food updated successfully");
      return updatedFood;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to update food";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function deleteFood(foodId: number): Promise<void> {
    try {
      showLoading("Deleting food...");
      await foodApi.deleteFood(foodId);
      foodStore.removeUserFood(foodId);
      toast.success("Food deleted successfully");
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete food";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  return {
    loadUserFoods,
    searchFoods,
    saveFood,
    updateFood,
    deleteFood,
  };
}
