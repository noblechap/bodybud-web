export interface WorkoutCategory {
  id: number;
  name: string;
  rank: number;
  workouts: WorkoutTemplateDetail[];
}

export interface WorkoutTemplateDetail {
  id: number;
  name: string;
  category: number;
  workout_exercises: WorkoutExerciseDetail[];
}

export interface WorkoutExerciseDetail {
  exercise: Exercise;
  rank: number;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  body_part: number;
  weight_type: number;
  image_path?: string;
}

export interface CreateWorkoutCategoryPayload {
  name: string;
  rank: number;
}

export interface CreateWorkoutTemplatePayload {
  name: string;
  category: number;
  workout_exercises: {
    exercise: number;
    rank: number;
  }[];
}

export interface UpdateWorkoutTemplatePayload {
  name: string;
  category: number;
  workout_exercises: {
    exercise: number;
    rank: number;
  }[];
}

export function useWorkoutTemplateApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function createCategory(clientId: number, payload: CreateWorkoutCategoryPayload) {
    return $authenticatedApi<WorkoutCategory>(`/users/${clientId}/workout-categories/`, {
      method: "POST",
      body: payload,
    });
  }

  async function deleteCategory(clientId: number, categoryId: number) {
    return $authenticatedApi<void>(`/users/${clientId}/workout-categories/${categoryId}/`, {
      method: "DELETE",
    });
  }

  async function createWorkoutTemplate(clientId: number, payload: CreateWorkoutTemplatePayload) {
    return $authenticatedApi<WorkoutTemplateDetail>(`/users/${clientId}/workouts/`, {
      method: "POST",
      body: payload,
    });
  }

  async function updateWorkoutTemplate(clientId: number, workoutId: number, payload: UpdateWorkoutTemplatePayload) {
    return $authenticatedApi<WorkoutTemplateDetail>(`/users/${clientId}/workouts/${workoutId}/`, {
      method: "PUT",
      body: payload,
    });
  }

  async function deleteWorkoutTemplate(clientId: number, workoutId: number) {
    return $authenticatedApi<void>(`/users/${clientId}/workouts/${workoutId}/`, {
      method: "DELETE",
    });
  }

  return {
    createCategory,
    deleteCategory,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
  };
}
