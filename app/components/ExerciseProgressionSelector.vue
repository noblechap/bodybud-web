<!-- components/client/ExerciseProgressionSelector.vue -->
<script setup lang="ts">
import { useExerciseStore, type Exercise } from "~/store/exerciseStore";
import { BodyPart } from "~/types/bodyPart";
import type { WeightType } from "~/types/weightType";
import { useBodyPart } from "~/composables/enums/useBodyPart";
import { useWeightType } from "~/composables/enums/useWeightType";
import { useExerciseService } from "~/composables/services/useExerciseService";

const { getBodyPartLabel, getBodyPartOptions } = useBodyPart();
const { getWeightTypeLabel, getWeightTypeOptions } = useWeightType();

const props = defineProps<{
  clientId: string | number;
}>();

const emit = defineEmits<{
  exerciseSelected: [exercise: Exercise, repCount: number];
}>();

// Refs
const exerciseSearch = ref("");
const bodyPartTab = ref("all");
const selectedExercise = ref<Exercise | null>(null);
const repCount = ref<number | null>(null);
const repCountInput = ref("");
const isLoading = ref(false);
const exerciseStore = useExerciseStore();

// Filtered exercises
const filteredExercises = computed(() => {
  let exercises = exerciseStore.exercises;

  // Filter by search term
  if (exerciseSearch.value) {
    const searchTerm = exerciseSearch.value.toLowerCase();
    exercises = exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(searchTerm)
        || (ex.description && ex.description.toLowerCase().includes(searchTerm)),
    );
  }

  // Filter by body part
  if (bodyPartTab.value !== "all") {
    const bodyPartMap: Record<string, BodyPart> = {
      chest: BodyPart.Chest,
      back: BodyPart.Back,
      legs: BodyPart.Legs,
      arms: BodyPart.Arms,
    };
    exercises = exercises.filter(
      (ex) => ex.body_part === bodyPartMap[bodyPartTab.value],
    );
  }

  return exercises;
});

// Labels
function weightTypeLabel(type: number) {
  return getWeightTypeLabel(type as WeightType);
}

function bodyPartLabel(part: number) {
  return getBodyPartLabel(part as BodyPart);
}

// Exercise selection
function selectExercise(exercise: Exercise) {
  selectedExercise.value = exercise;
  repCountInput.value = "";
  repCount.value = null;
}

function clearSelection() {
  selectedExercise.value = null;
  repCount.value = null;
  repCountInput.value = "";
}

// Validate and set rep count
function validateRepCount() {
  const num = parseInt(repCountInput.value);
  if (!isNaN(num) && num > 0 && num <= 100) {
    repCount.value = num;
    return true;
  }
  return false;
}

function getExerciseImage(imageName: string | undefined): string {
  if (!imageName)
    return "";
  try {
    return `/img/exercises/${imageName}_right.png`;
  }
  catch {
    console.warn("Missing image:", imageName);
    return "";
  }
}

// Handle rep count input
function onRepCountInput() {
  const num = parseInt(repCountInput.value);
  if (!isNaN(num) && num > 0 && num <= 100) {
    repCount.value = num;
  } else {
    repCount.value = null;
  }
}

// Load progression data
async function loadExerciseProgression() {
  if (!selectedExercise.value || !repCount.value) return;

  try {
    isLoading.value = true;
    
    // Emit event to parent component with exercise and rep count
    emit('exerciseSelected', selectedExercise.value, repCount.value);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
}

// Quick rep count suggestions
const repCountSuggestions = [1, 3, 5, 8, 10, 12, 15, 20];

// Keyboard shortcuts
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && selectedExercise.value && repCount.value) {
    loadExerciseProgression();
  }
}

// Add event listener for keyboard
onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <v-card class="exercise-library-card" elevation="2">
    <v-card-title class="py-3 bg-primary">
      <span class="text-h6 font-weight-bold">Exercise Progression Analysis</span>
    </v-card-title>

    <div class="library-scroll-container">
      <v-card-text class="library-content">
        <!-- Selected Exercise Display -->
        <div v-if="selectedExercise" class="selected-exercise mb-6">
          <v-card class="selected-card pa-4" elevation="1" color="blue-lighten-5">
            <div class="d-flex align-center">
              <div class="mr-4">
                <div class="avatar-wrapper mr-3">
                      <v-img
                        v-if="selectedExercise.image_path"
                        :src="
                          getExerciseImage(selectedExercise.image_path)
                        "
                        width="80"
                        height="80"
                        class="rounded"
                        contain
                      />
                      <v-avatar
                        v-else
                        size="60"
                        color="blue"
                        class="text-white font-weight-bold"
                      >
                        {{ selectedExercise.name.charAt(0) }}
                      </v-avatar>
                    </div>
              </div>
              <div class="flex-grow-1">
                <div class="font-weight-bold text-h6 mb-1">
                  {{ selectedExercise.name }}
                </div>
                <div class="text-caption text-grey mb-2">
                  {{ selectedExercise.description || "No description" }}
                </div>
                <div class="d-flex">
                  <v-chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    class="mr-2"
                  >
                    {{ weightTypeLabel(selectedExercise.weight_type) }}
                  </v-chip>
                  <v-chip size="small" variant="outlined" color="secondary">
                    {{ bodyPartLabel(selectedExercise.body_part) }}
                  </v-chip>
                </div>
              </div>
              <v-btn icon @click="clearSelection">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card>

          <!-- Rep Count Input -->
          <div class="rep-count-section mt-4">
            <div class="text-subtitle-1 font-weight-medium mb-2">
              Enter Target Rep Count:
            </div>
            
            <!-- Quick Suggestions -->
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-2">
                Quick Select:
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="suggestion in repCountSuggestions"
                  :key="suggestion"
                  :color="repCount === suggestion ? 'primary' : 'default'"
                  variant="outlined"
                  class="cursor-pointer"
                  @click="repCount = suggestion; repCountInput = suggestion.toString()"
                >
                  {{ suggestion }} reps
                </v-chip>
              </div>
            </div>

            <!-- Manual Input -->
            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model="repCountInput"
                label="Rep Count"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
                class="rep-input"
                @input="onRepCountInput"
                @keyup.enter="loadExerciseProgression"
              />
              <v-btn
                :disabled="!repCount || isLoading"
                :loading="isLoading"
                color="primary"
                size="large"
                prepend-icon="mdi-chart-line"
                @click="loadExerciseProgression"
              >
                Analyze Progression
              </v-btn>
            </div>
            
            <div class="text-caption text-medium-emphasis mt-2">
              Enter a rep count between 1-100 to analyze performance over time
            </div>
            
            <v-alert v-if="repCount && selectedExercise" variant="tonal" color="info" class="mt-4">
              <div class="text-caption">
                Press <v-chip size="x-small" class="mx-1">Enter</v-chip> to quickly analyze {{ selectedExercise.name }} at {{ repCount }} reps
              </div>
            </v-alert>
          </div>
        </div>

        <!-- Exercise Search and Filter (when no exercise selected) -->
        <div v-else>
          <div class="search-container">
            <div class="search-wrapper">
              <v-text-field
                v-model="exerciseSearch"
                label="Search exercises..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                clearable
                density="comfortable"
                hide-details
                class="search-field"
              />
            </div>
          </div>

          <div class="drop-hint mb-4">
            <v-icon icon="mdi-cursor-default-click" class="mr-2" />
            Click exercises to analyze progression
          </div>

          <v-tabs
            v-model="bodyPartTab"
            density="compact"
            class="library-tabs mb-4"
          >
            <v-tab value="all">
              All
            </v-tab>
            <v-tab value="chest">
              Chest
            </v-tab>
            <v-tab value="back">
              Back
            </v-tab>
            <v-tab value="legs">
              Legs
            </v-tab>
            <v-tab value="arms">
              Arms
            </v-tab>
          </v-tabs>

          <div class="exercise-grid">
            <v-card
              v-for="exercise in filteredExercises"
              :key="exercise.id"
              class="exercise-card"
              elevation="1"
              ripple
              @click="selectExercise(exercise)"
            >
              <v-card-text class="pa-3 d-flex">
                <div class="avatar-wrapper mr-3">
                      <v-img
                        v-if="exercise.image_path"
                        :src="
                          getExerciseImage(exercise.image_path)
                        "
                        width="80"
                        height="80"
                        class="rounded"
                        contain
                      />
                      <v-avatar
                        v-else
                        size="60"
                        color="blue"
                        class="text-white font-weight-bold"
                      >
                        {{ exercise.name.charAt(0) }}
                      </v-avatar>
                    </div>

                <div class="flex-grow-1">
                  <div class="exercise-header">
                    <div class="font-weight-bold text-body-1">
                      {{ exercise.name }}
                    </div>
                  </div>
                  <div class="text-caption text-grey mb-2">
                    {{ exercise.description || "No description" }}
                  </div>
                  <div class="exercise-meta d-flex">
                    <v-chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      class="mr-2"
                    >
                      {{ weightTypeLabel(exercise.weight_type) }}
                    </v-chip>
                    <v-chip size="small" variant="outlined" color="secondary">
                      {{ bodyPartLabel(exercise.body_part) }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- No results message -->
          <div v-if="filteredExercises.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-dumbbell-off</v-icon>
            <div class="text-h6 text-grey mb-2">No exercises found</div>
            <div class="text-caption text-grey">
              Try a different search term or body part filter
            </div>
          </div>
        </div>
      </v-card-text>
    </div>
  </v-card>
  <!-- Instructions -->
        <div class="instructions mt-6">
          <v-alert variant="tonal" color="primary" icon="mdi-information">
            <template #title>
              How to use Exercise Progression Analysis:
            </template>
            <div class="text-caption">
              1. <strong>Select an exercise</strong> from the list above<br>
              2. <strong>Enter the rep count</strong> you want to analyze (use quick select or type manually)<br>
              3. <strong>Click "Analyze Progression"</strong> to view performance trends over time<br>
              4. View weight progression, estimated 1RM, volume, and historical data
            </div>
          </v-alert>
        </div>
</template>

<style scoped>

  
.exercise-library-card {
  height: 60vh;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
/* Selected exercise section */
.selected-card {
  border: 2px solid rgb(var(--v-theme-primary));
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.rep-count-section {
  background-color: rgba(var(--v-theme-primary), 0.05);
  padding: 20px;
  border-radius: 8px;
}

.rep-input {
  max-width: 150px;
}

.exercise-library-card {
  .library-scroll-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .library-content {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: min-content;
    }
  }

  .search-container {
    margin-bottom: 16px;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-field {
    flex-grow: 1;
    margin-bottom: 0 !important;
  }

  .create-btn {
    height: 48px;
  }

  .drop-hint {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-primary));
    padding: 8px 12px;
    background: rgba(var(--v-theme-primary), 0.05);
    border-radius: 6px;
    margin-bottom: 16px;
  }
}

/* Exercise Grid Layout */
.exercise-grid {
  display: grid;
  gap: 16px;
  padding: 4px;
  align-content: start;

  @media (min-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1200px) and (max-width: 1599px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 800px) and (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 799px) {
    grid-template-columns: 1fr;
  }
}

.exercise-card {
  cursor: pointer !important;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: grab;
    border-color: rgba(var(--v-theme-primary), 0.3);
  }

  .v-card-text {
    flex-direction: column;
    padding: 12px;
    gap: 8px;

    @media (min-width: 600px) {
      flex-direction: row;
    }
  }
  .exercise-meta {
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  cursor: pointer !important;
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.exercise-card:active {
  cursor: pointer !important;
}

/* Change the drop hint icon and text */
.drop-hint {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-primary));
  padding: 8px 12px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
  margin-bottom: 16px;
}

.instructions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 20px;
}

.cursor-pointer {
  cursor: pointer;
}

/* Avatar/Image Styles */
.avatar-wrapper {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .v-avatar {
    font-size: 1.5rem;
  }

  .v-img {
    object-fit: contain;
  }
}

.avatar-wrapper-50 {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  border-radius: 4px;
  overflow: hidden;

  .v-avatar {
    font-size: 1.5rem;
  }

  .v-img {
    object-fit: contain;
  }
}
</style>