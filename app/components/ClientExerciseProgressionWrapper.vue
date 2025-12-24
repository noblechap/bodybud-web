<!-- components/client/ClientExerciseProgressionWrapper.vue -->
<script setup lang="ts">
import { useClientStore } from "~/store/clientStore";
import { useExerciseService } from "~/composables/services/useExerciseService";

const clientStore = useClientStore();
const exerciseService = useExerciseService();
const showProgression = ref(false);
const selectedExercise = ref<{ id: number; name: string } | null>(null);
const selectedRepCount = ref<number | null>(null);

// When an exercise is selected from the selector
function handleExerciseSelected(exercise: any, repCount: number) {
  selectedExercise.value = { id: exercise.id, name: exercise.name };
  selectedRepCount.value = repCount;
  showProgression.value = true;
}

onMounted(() => {
  exerciseService.fetchExercises();
});

// Function to go back to exercise selection
function goBackToSelection() {
  // Clear the progression data in store
  clientStore.setExerciseProgression([]);
  showProgression.value = false;
  selectedExercise.value = null;
  selectedRepCount.value = null;
}
</script>

<template>
  <div class="exercise-progression-wrapper">
    <!-- Back button when in progression view -->
    <div v-if="showProgression && selectedExercise" class="mb-6">
      <div class="d-flex align-center justify-end mb-4">
        <v-btn
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="goBackToSelection"
        >
          Back to Exercise Selection
        </v-btn>
      </div>
      
      <!-- Selected exercise info banner -->
      <v-alert variant="tonal" color="primary" class="mb-4">
        <template #title>
          Analyzing: {{ selectedExercise.name }} @ {{ selectedRepCount }} reps
        </template>
        <div class="text-caption">
          Click the back button above to analyze a different exercise or rep count
        </div>
      </v-alert>
    </div>

    <div class="d-flex justify-center">
      <div class="w-100">
        <!-- Show selector or progression view based on state -->
        <ExerciseProgressionSelector
          v-if="!showProgression"
          :client-id="clientStore.clientId!"
          @exercise-selected="handleExerciseSelected"
        />
        
        <ExerciseProgressionView
          v-else
          :exercise-id="selectedExercise?.id"
          :exercise-name="selectedExercise?.name"
          :rep-count="selectedRepCount"
          @return-to-selection="goBackToSelection"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-progression-wrapper {
  min-height: 600px;
  padding-top: 20px;
}
</style>