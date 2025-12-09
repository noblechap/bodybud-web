import type { Exercise } from "./useWorkoutTemplateApi";

export interface CreateExercisePayload {
  user?: number;
  name: string;
  description?: string;
  body_part: number;
  weight_type: number;
}

export function useExerciseApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function fetchUserExercises(userId: number) {
    return $authenticatedApi<Exercise[]>(`/users/${userId}/exercises/`);
  }

  async function fetchAllExercises() {
    return $authenticatedApi<Exercise[]>("/exercises/");
  }

  async function createExercise(payload: CreateExercisePayload) {
    return $authenticatedApi<Exercise>("/exercises/", {
      method: "POST",
      body: payload,
    });
  }

  return {
    fetchUserExercises,
    fetchAllExercises,
    createExercise,
  };
}
