import type {
  Food,
  Meal,
  MealFood,
  MealPlan,
  PlannedMeal,
} from "~/types/food";
import type { MealTemplate } from "~/types/models";
import { useFoodStore } from "~/store/foodStore";

/**
 * Composable for meal plan management and operations
 */
export function useMealPlan() {
  const toast = useToast();
  const _foodStore = useFoodStore();

  /**
   * Create an empty meal plan with default structure
   * @param username Client's username for the plan name
   * @param mealsPerDay Number of meals to create
   * @returns Empty meal plan structure
   */
  function createEmptyMealPlan(username: string, mealsPerDay: number): MealPlan {
    return {
      client: 0, // Will be set when saving
      name: `${username}'s meal plan`,
      description: "",
      planned_meals: Array.from({ length: mealsPerDay }, (_, i) => ({
        rank: i + 1,
        meal: {
          name: `Meal ${i + 1}`,
          meal_foods: [],
        },
      })),
    };
  }

  /**
   * Add a new meal to the meal plan
   * @param mealPlan Current meal plan to modify
   * @returns Updated meal plan with new meal added
   */
  function addMeal(mealPlan: MealPlan): MealPlan {
    const newRank = mealPlan.planned_meals.length + 1;

    if (newRank > 8) {
      toast.warning("Maximum 8 meals per day");
      return mealPlan;
    }

    const updatedPlan = { ...mealPlan };
    updatedPlan.planned_meals = [
      ...updatedPlan.planned_meals,
      {
        rank: newRank,
        meal: {
          name: `Meal ${newRank}`,
          meal_foods: [],
        },
      },
    ];

    return updatedPlan;
  }

  /**
   * Remove a meal from the meal plan and re-rank remaining meals
   * @param mealPlan Current meal plan
   * @param rank Rank of the meal to remove
   * @returns Updated meal plan with meal removed
   */
  function removeMeal(mealPlan: MealPlan, rank: number): MealPlan {
    const updatedPlan = { ...mealPlan };
    updatedPlan.planned_meals = updatedPlan.planned_meals
      .filter((m) => m.rank !== rank)
      .map((m, i) => ({ ...m, rank: i + 1 }));

    return updatedPlan;
  }

  /**
   * Add a food item to a specific meal
   * @param plannedMeal Planned meal to add food to
   * @param food Food item to add
   * @param servingSize Serving size in grams
   * @returns Updated planned meal
   */
  function addFoodToMeal(
    plannedMeal: PlannedMeal,
    food: Food,
    servingSize?: number
  ): PlannedMeal {
    const updatedMeal = { ...plannedMeal };
    updatedMeal.meal = {
      ...updatedMeal.meal,
      meal_foods: [
        ...updatedMeal.meal.meal_foods,
        {
          food: { ...food },
          serving_size_g: servingSize || food.serving_size || 100,
        },
      ],
    };

    return updatedMeal;
  }

  /**
   * Remove a food item from a meal
   * @param plannedMeal Planned meal to remove food from
   * @param foodId ID of the food to remove
   * @returns Updated planned meal
   */
  function removeFoodFromMeal(plannedMeal: PlannedMeal, foodId: number): PlannedMeal {
    const updatedMeal = { ...plannedMeal };
    updatedMeal.meal = {
      ...updatedMeal.meal,
      meal_foods: updatedMeal.meal.meal_foods.filter(
        (mf) => mf.food.id !== foodId
      ),
    };

    return updatedMeal;
  }

  /**
   * Handle drag start event for food items
   * @param event Drag event
   * @param food Food being dragged
   */
  function handleFoodDragStart(event: DragEvent, food: Food): void {
    if (!event.dataTransfer)
      return;

    event.dataTransfer.setData("application/json", JSON.stringify(food));
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.dataset.json = JSON.stringify(food);
    }
  }

  /**
   * Handle drag start event for meal templates
   * @param event Drag event
   * @param meal Meal template being dragged
   */
  function handleMealDragStart(event: DragEvent, meal: MealTemplate): void {
    if (!event.dataTransfer)
      return;

    event.dataTransfer.setData("application/json", JSON.stringify(meal));
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.dataset.json = JSON.stringify(meal);
    }
  }

  /**
   * Handle drop event for food or meal onto a planned meal
   * @param plannedMeal Target planned meal
   * @param event Drop event
   * @returns Updated planned meal or null if drop failed
   */
  function handleDrop(
    plannedMeal: PlannedMeal,
    event: DragEvent
  ): PlannedMeal | null {
    event.preventDefault();

    if (!event.dataTransfer)
      return null;

    try {
      const data = JSON.parse(event.dataTransfer.getData("application/json"));

      // Check if this is a meal template drop
      if (data.meal_foods) {
        const updatedMeal = { ...plannedMeal };
        updatedMeal.meal = {
          name: data.name,
          meal_foods: data.meal_foods.map((mealFood: MealFood) => ({
            food: { ...mealFood.food },
            serving_size_g: mealFood.serving_size_g,
          })),
        };
        return updatedMeal;
      }

      // Otherwise it's a food drop
      addFoodToUserLibrary(data);
      return addFoodToMeal(plannedMeal, data);
    }
    catch (e) {
      console.error("Drop failed:", e);
      return null;
    }
  }

  /**
   * Handle add event when dragging food to an existing meal (vuedraggable)
   */
  function handleAddToExistingMeal(event: { item: { dataset: { json?: string } } }): void {
    try {
      const food = JSON.parse(event.item.dataset.json || "{}") as Food;
      if (food.id) {
        addFoodToUserLibrary(food);
      }
    }
    catch (e) {
      console.error("Add to existing meal failed:", e);
    }
  }

  /**
   * Add a food to user's library if it's from search results
   * @param food Food to potentially add to library
   */
  function addFoodToUserLibrary(food: Food): void {
    const isFromSearch = _foodStore.searchResults.some((item: Food) => item.id === food.id);
    const isAlreadyInLibrary = _foodStore.userFoods.some((item: Food) => item.id === food.id);

    if (isFromSearch && !isAlreadyInLibrary) {
      _foodStore.addUserFood({ ...food });
    }
  }

  return {
    createEmptyMealPlan,
    addMeal,
    removeMeal,
    addFoodToMeal,
    removeFoodFromMeal,
    handleFoodDragStart,
    handleMealDragStart,
    handleDrop,
    handleAddToExistingMeal,
    addFoodToUserLibrary,
  };
}
