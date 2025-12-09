import type {
  BodyWeight,
  StepData,
  StepGoal,
  Supplement,
  WorkoutHistory,
  WorkoutTemplate,
} from "~/types/client";
import type { FoodGoals, MealPlan } from "~/types/food";
import type { CheckIn } from "~/types/models";
import { defineStore } from "pinia";

interface WorkoutCategory {
  id: number;
  name: string;
  rank: number;
  workouts: Array<{ id: number; [key: string]: unknown }>;
}

export const useClientStore = defineStore("client", () => {
  // State
  const workout_history = ref<WorkoutHistory[]>([]);
  const workout_templates = ref<WorkoutTemplate[] | WorkoutCategory[]>([]);
  const supplements = ref<Supplement[]>([]);
  const bodyweights = ref<BodyWeight[]>([]);
  const food_goals = ref<FoodGoals>({} as FoodGoals);
  const meal_plan = ref<MealPlan | null>(null);
  const client_checkins = ref<CheckIn[]>([]);
  const steps = ref<StepData[]>([]);
  const stepGoal = ref<StepGoal>({} as StepGoal);

  const clientId = ref<number | null>(null);
  const username = ref<string | null>(null);
  const usingPounds = ref(true);
  const mediaLoading = ref(false);

  // Actions pour setter le state
  function setClientData(data: {
    id: number;
    username: string;
    using_pounds: boolean;
    workout_history?: WorkoutHistory[];
    workout_templates?: WorkoutTemplate[] | WorkoutCategory[];
    supplements?: Supplement[];
    bodyweights?: BodyWeight[];
    food_goals?: FoodGoals;
    meal_plan?: MealPlan;
    client_checkins?: CheckIn[];
  }) {
    clientId.value = data.id;
    username.value = data.username;
    usingPounds.value = data.using_pounds;
    workout_history.value = data.workout_history || [];
    workout_templates.value = data.workout_templates || [];
    supplements.value = data.supplements || [];
    bodyweights.value = data.bodyweights || [];
    food_goals.value = data.food_goals || ({} as FoodGoals);
    meal_plan.value = data.meal_plan || null;
    client_checkins.value = data.client_checkins || [];
    steps.value = [];
    stepGoal.value = {} as StepGoal;
  }

  function setMealPlan(data: { food_goals: FoodGoals; meal_plan: MealPlan }) {
    food_goals.value = data.food_goals;
    meal_plan.value = data.meal_plan;
  }

  function setSteps(data: StepData[]) {
    steps.value = data;
  }

  function setStepGoal(data: StepGoal) {
    stepGoal.value = data;
  }

  function updateCheckin(checkin: CheckIn) {
    const index = client_checkins.value.findIndex((c) => c.id === checkin.id);
    if (index !== -1) {
      client_checkins.value[index] = checkin;
    }
  }

  function addSupplement(supplement: Supplement) {
    supplements.value.push(supplement);
  }

  function updateSupplement(supplement: Supplement) {
    const index = supplements.value.findIndex((s) => s.id === supplement.id);
    if (index !== -1) {
      supplements.value[index] = supplement;
    }
  }

  function deleteSupplement(supplementId: number) {
    const index = supplements.value.findIndex((s) => s.id === supplementId);
    if (index !== -1) {
      supplements.value.splice(index, 1);
    }
  }

  function addBodyWeight(bodyWeight: BodyWeight) {
    bodyweights.value.push(bodyWeight);
  }

  function deleteBodyWeight(bodyWeightId: number) {
    const index = bodyweights.value.findIndex((bw) => bw.id === bodyWeightId);
    if (index !== -1) {
      bodyweights.value.splice(index, 1);
    }
  }

  function resetClientData() {
    clientId.value = null;
    username.value = null;
    usingPounds.value = true;
    workout_history.value = [];
    workout_templates.value = [];
    supplements.value = [];
    bodyweights.value = [];
    food_goals.value = {} as FoodGoals;
    meal_plan.value = null;
    client_checkins.value = [];
    steps.value = [];
    stepGoal.value = {} as StepGoal;
  }

  return {
    // State
    clientId,
    username,
    workout_history,
    workout_templates,
    supplements,
    bodyweights,
    food_goals,
    meal_plan,
    client_checkins,
    steps,
    stepGoal,
    mediaLoading,
    usingPounds,

    // Actions
    setClientData,
    setMealPlan,
    setSteps,
    setStepGoal,
    updateCheckin,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    addBodyWeight,
    deleteBodyWeight,
    resetClientData,
  };
});
