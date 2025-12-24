import type { FoodGoals, MealPlan } from "~/types/food";
import type { CheckIn } from "~/types/models";

export interface Exercise {
  id: number;
  name: string;
  weight_type: number;
}

export interface Performance {
  rank: number;
  weight: number;
  reps: number;
  rpe: number;
  pr: boolean;
}

export interface WorkoutExercise {
  rank: number;
  exercise: Exercise;
  performances: Performance[];
}

export interface WorkoutHistory {
  id: number;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  rank: number;
  workouts: Array<{ id: number; [key: string]: unknown }>;
}

export interface Supplement {
  id: number;
  name: string;
  dose: string;
  notes?: string;
  date: string;
}

export interface BodyWeight {
  id: number;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  notes?: string;
}

export interface StepData {
  id: number;
  date: string;
  steps: number;
  step_goal: number;
}

export interface StepGoal {
  id: number;
  step_goal: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateNutritionPlanPayload {
  meal_plan: MealPlan;
  food_goals: FoodGoals;
}

export interface UpdateNutritionPlanResponse {
  meal_plan: MealPlan;
  food_goals: FoodGoals;
}

export interface ExerciseProgressionPayload {
  min_reps: number;
  max_reps: number;
} 

export interface ExerciseProgression {
  date: string; 
  reps: number;
  weight: number;
  rpe: number;
  pr: boolean;
  workout_instance_id: number;
  set_rank: number;
  exercise_name: string;
}
