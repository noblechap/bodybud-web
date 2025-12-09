export interface Food {
  id: number;
  name: string;
  description: string;
  calories_per_g: number;
  carbs_per_g: number;
  proteins_per_g: number;
  fats_per_g: number;
  serving_size: number;
  serving_size_g?: number;
  serving_size_unit: string;
  user: number;
  created_at?: string;
  updated_at?: string;
}

export interface MealFood {
  id?: number;
  food: Food;
  serving_size_g: number;
}

export interface Meal {
  id?: number;
  name: string;
  meal_foods: MealFood[];
}

export interface PlannedMeal {
  id?: number;
  rank: number;
  meal: Meal;
}

export interface MealPlan {
  id?: number;
  client: number;
  name: string;
  description: string;
  planned_meals: PlannedMeal[];
  created_at?: string;
  updated_at?: string;
}

export interface FoodGoals {
  id?: number;
  meals_per_day: number;
  carb_goal: number;
  protein_goal: number;
  fat_goal: number;
}

export interface UpdateMealPlanPayload {
  food_goals: Partial<FoodGoals>;
  meal_plan: {
    client: number;
    description: string;
    name: string;
    planned_meals: Array<{
      meal_data: {
        meal_foods: Array<{
          food: number;
          serving_size_g: number;
        }>;
        name: string;
      };
      rank: number;
    }>;
  };
}

export interface SaveFoodPayload {
  name: string;
  description: string;
  calories_per_g: number | string;
  carbs_per_g: number | string;
  proteins_per_g: number | string;
  fats_per_g: number | string;
  serving_size: number;
  serving_size_unit: string;
  user: number;
}
