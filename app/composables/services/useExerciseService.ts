import type { CreateExercisePayload } from "~/composables/api/coaching/useExerciseApi";
import { useExerciseApi } from "~/composables/api/coaching/useExerciseApi";
import { useAuthStore } from "~/store/authStore";
import { useExerciseStore } from "~/store/exerciseStore";

export function useExerciseService() {
  const exerciseApi = useExerciseApi();
  const exerciseStore = useExerciseStore();
  const authStore = useAuthStore();
  const toast = useToast();
  const { showLoading, hideLoading } = useGlobalLoading();

  async function fetchExercises() {
    if (!authStore.user?.id) {
      console.warn("No user authenticated");
      return;
    }

    try {
      showLoading("Loading exercises...");

      const [userExercises, allExercises] = await Promise.all([
        exerciseApi.fetchUserExercises(authStore.user.id),
        exerciseApi.fetchAllExercises(),
      ]);

      // Combine and remove duplicates
      const uniqueExercises = [...userExercises, ...allExercises].reduce(
        (acc, current) => {
          const exists = acc.find((item) => item.id === current.id);
          if (!exists) {
            return acc.concat([current]);
          }
          return acc;
        },
        [] as typeof userExercises,
      );

      exerciseStore.exercises = uniqueExercises;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to fetch exercises";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function createExercise(payload: CreateExercisePayload) {
    try {
      showLoading("Creating exercise...");
      const response = await exerciseApi.createExercise(payload);

      exerciseStore.exercises.push(response);
      toast.success("Exercise created successfully!");

      return response;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to create exercise";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  return {
    fetchExercises,
    createExercise,
  };
}
