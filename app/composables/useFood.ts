import type { Food, Meal, MealFood } from "~/types/food";
import { smartRound } from "~/utils/rounding";

/**
 * Composable for food-related calculations and utilities
 */
export function useFood() {
  /**
   * Calculate total macronutrients across all planned meals
   * @param plannedMeals Array of planned meals with rank and meal data
   * @param nutrient Name of the nutrient to calculate (proteins, carbs, fats, calories)
   * @returns Total amount of the specified nutrient
   */
  function calculateTotal(
    plannedMeals: Array<{ meal: Meal; rank: number }>,
    nutrient: "calories" | "carbs" | "fats" | "proteins",
  ): number {
    return plannedMeals.reduce((total, plannedMeal) => {
      return total + calculateMealTotal(plannedMeal.meal, nutrient);
    }, 0);
  }

  /**
   * Calculate total macronutrients for a single meal
   * @param meal Meal object containing meal_foods array
   * @param nutrient Name of the nutrient to calculate
   * @returns Total amount of the specified nutrient in the meal
   */
  function calculateMealTotal(
    meal: Meal,
    nutrient: "calories" | "carbs" | "fats" | "proteins",
  ): number {
    const nutrientKey = `${nutrient}_per_g` as keyof Food;

    return meal.meal_foods.reduce((total, mealFood: MealFood) => {
      if (!mealFood?.food)
        return total;

      const nutrientValue = mealFood.food[nutrientKey];
      if (typeof nutrientValue !== "number")
        return total;

      return total + nutrientValue * mealFood.serving_size_g;
    }, 0);
  }

  /**
   * Clone a food item for drag & drop operations
   * @param food Food object to clone
   * @returns MealFood object with cloned food and default serving size
   */
  function cloneFood(food: Food): MealFood {
    return {
      food: { ...food },
      serving_size_g: food.serving_size || 100,
    };
  }

  return {
    calculateMealTotal,
    calculateTotal,
    cloneFood,
    smartRound,
  };
}
