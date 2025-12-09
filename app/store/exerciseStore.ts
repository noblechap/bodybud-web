import { defineStore } from "pinia";

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  body_part: number;
  weight_type: number;
  image_path?: string;
}

export const useExerciseStore = defineStore("exercise", () => {
  const exercises = ref<Exercise[]>([]);
  const isLoading = ref(false);

  return {
    exercises,
    isLoading,
  };
});
