import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getClientById,
  updateNutritionPlan,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  createWorkoutTemplate,
  createWorkoutCategory,
  deleteWorkoutCategory,
  addNewSupplement,
  updateExistingSupplement,
  deleteExistingSupplement,
  signalChanges,
  deleteClient,
  assignClientCheckIn,
  getCheckinById,
  fetchClientSteps,
  fetchClientStepsGoal,
  updateClientStepsGoal,
} from "../services/clientService";

export const useClientStore = defineStore("client", () => {
  const workout_history = ref([]);
  const workout_templates = ref([]);
  const supplements = ref([]);
  const bodyweights = ref([]);
  const food_goals = ref({});
  const meal_plan = ref(null);
  const client_checkins = ref([]);
  const steps = ref([]);
  const stepGoal = ref({});

  const clientId = ref(null);
  const username = ref(null);
  const usingPounds = ref(true);
  const isLoading = ref(false);
  const mediaLoading = ref(false);
  const error = ref(null);

  async function fetchClient(id) {
    try {
      isLoading.value = true;
      const data = await getClientById(id);
      username.value = data.username;
      usingPounds.value = data.using_pounds;
      workout_history.value = data.workout_history || [];
      workout_templates.value = data.workout_templates || [];
      supplements.value = data.supplements || [];
      bodyweights.value = data.bodyweights || [];
      food_goals.value = data.food_goals[0];
      meal_plan.value = data.meal_plan[0];
      client_checkins.value = data.client_checkins || [];
      steps.value = [];
      stepGoal.value = {};

      clientId.value = id;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCheckin(id) {
    try {
      mediaLoading.value = true;
      const data = await getCheckinById(id);

      const checkinIndex = client_checkins.value.findIndex(
        (checkin) => checkin.id === id,
      );
      if (checkinIndex !== -1) {
        client_checkins.value[checkinIndex] = data;
      }
      return data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      mediaLoading.value = false;
    }
  }

  async function fetchSteps() {
    try {
      const data = await fetchClientSteps(clientId.value);
      steps.value = data || [];

      const data2 = await fetchClientStepsGoal(clientId.value);
      stepGoal.value = data2 || {};
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function updateSteps(goalId, newStepGoal) {
    try {
      const payload = {
        step_goal: newStepGoal,
      };

      const response = await updateClientStepsGoal(
        clientId.value,
        goalId,
        payload,
      );
      stepGoal.value = response || {};
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function removeClient() {
    try {
      const response = await deleteClient(clientId.value);

      // Reset all client-related data
      clientId.value = null;
      username.value = null;
      usingPounds.value = true;
      workout_history.value = [];
      workout_templates.value = [];
      supplements.value = [];
      bodyweights.value = [];
      food_goals.value = {};
      meal_plan.value = null;

      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePlan(clientId, payload) {
    try {
      const response = await updateNutritionPlan(clientId, payload);

      food_goals.value = response.food_goals;
      meal_plan.value = response.meal_plan;

      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function updateWorkout(workoutId, payload) {
    try {
      const response = await updateWorkoutTemplate(
        clientId.value,
        workoutId,
        payload,
      );
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function createCategory(payload) {
    try {
      const response = await createWorkoutCategory(clientId.value, payload);
      const newCategory = {
        ...response,
        workouts: [],
      };
      workout_templates.value.push(newCategory);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function addSupplement(payload) {
    try {
      const response = await addNewSupplement(clientId.value, payload);
      supplements.value.push(response);
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function updateSupplement(payload) {
    try {
      const response = await updateExistingSupplement(clientId.value, payload);
      const supplementIndex = supplements.value.findIndex(
        (s) => s.id === payload.id,
      );
      if (supplementIndex !== -1) {
        supplements.value[supplementIndex] = response;
      }
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function deleteCategory(categoryId) {
    try {
      const response = await deleteWorkoutCategory(clientId.value, categoryId);
      const categoryIndex = workout_templates.value.findIndex(
        (category) => category.id === categoryId,
      );
      if (categoryIndex !== -1) {
        workout_templates.value.splice(categoryIndex, 1);
      }
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function deleteSupplement(id) {
    try {
      const response = await deleteExistingSupplement(clientId.value, id);
      const supplementIndex = supplements.value.findIndex((s) => s.id === id);
      if (supplementIndex !== -1) {
        supplements.value.splice(supplementIndex, 1);
      }
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function createWorkout(payload) {
    try {
      const response = await createWorkoutTemplate(clientId.value, payload);
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function deleteWorkout(workoutId) {
    try {
      const response = await deleteWorkoutTemplate(clientId.value, workoutId);

      workout_templates.value.forEach((category) => {
        const workoutIndex = category.workouts.findIndex(
          (w) => w.id === workoutId,
        );
        if (workoutIndex !== -1) {
          category.workouts.splice(workoutIndex, 1);
        }
      });
      await signalChanges(clientId.value);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  async function assignCheckIn(payload) {
    try {
      const response = await assignClientCheckIn(payload);
      client_checkins.value.unshift(response);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    }
  }

  return {
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
    isLoading,
    error,
    mediaLoading,
    fetchClient,
    fetchSteps,
    updateSteps,
    updatePlan,
    updateWorkout,
    createCategory,
    deleteCategory,
    createWorkout,
    deleteWorkout,
    addSupplement,
    updateSupplement,
    deleteSupplement,
    removeClient,
    assignCheckIn,
    fetchCheckin,
  };
});
