import type { Food } from "~/types/food";
import { defineStore } from "pinia";

export const useFoodStore = defineStore("food", () => {
  // State
  const userFoods = ref<Food[]>([]);
  const searchResults = ref<Food[]>([]);

  // Getters
  const hasFoods = computed(() => userFoods.value.length > 0);

  // Actions
  function setUserFoods(foods: Food[]) {
    userFoods.value = foods;
  }

  function addUserFood(food: Food) {
    userFoods.value.push(food);
  }

  function updateUserFood(foodId: number, updatedFood: Food) {
    const index = userFoods.value.findIndex((f) => f.id === foodId);
    if (index !== -1) {
      userFoods.value[index] = updatedFood;
    }
  }

  function removeUserFood(foodId: number) {
    const index = userFoods.value.findIndex((f) => f.id === foodId);
    if (index !== -1) {
      userFoods.value.splice(index, 1);
    }
  }

  function setSearchResults(results: Food[]) {
    searchResults.value = results;
  }

  function clearSearchResults() {
    searchResults.value = [];
  }

  return {
    // State
    userFoods,
    searchResults,

    // Getters
    hasFoods,

    // Actions
    setUserFoods,
    addUserFood,
    updateUserFood,
    removeUserFood,
    setSearchResults,
    clearSearchResults,
  };
}, {
  persist: {
    storage: localStorage,
    pick: ["userFoods"]
  }
});
