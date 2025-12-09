<script setup lang="ts">
import type { WeightType } from "~/types/weightType";

import draggable from "vuedraggable";

import { useBodyPart } from "~/composables/enums/useBodyPart";
import { useWeightType } from "~/composables/enums/useWeightType";
import { useExerciseService } from "~/composables/services/useExerciseService";
import { useWorkoutTemplateService } from "~/composables/services/useWorkoutTemplateService";
import { useAuthStore } from "~/store/authStore";
import { useExerciseStore } from "~/store/exerciseStore";
import { BodyPart } from "~/types/bodyPart";

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  saved: [template: Template];
  new: [template: Template];
}>();
const exerciseStore = useExerciseStore();
const workoutTemplateService = useWorkoutTemplateService();
const exerciseService = useExerciseService();
const authStore = useAuthStore();
const { getBodyPartLabel, getBodyPartOptions } = useBodyPart();
const { getWeightTypeLabel, getWeightTypeOptions } = useWeightType();

interface Exercise {
  id: number;
  name: string;
  description?: string;
  body_part: number;
  weight_type: number;
  image_path?: string;
}

interface WorkoutExercise {
  exercise: Exercise;
  rank: number;
}

interface Template {
  id: number | null;
  name: string;
  category: number;
  workout_exercises: WorkoutExercise[];
}

interface Props {
  template: Template;
}

// Reactive state
const hasChanges = ref(false);
const exerciseSearch = ref("");
const isDragging = ref(false);
const showExerciseDialog = ref(false);
const showDeleteDialog = ref(false);
const bodyPartTab = ref("all");
const isAddingExercise = ref(false);
const nameFocused = ref(false);
const isNewWorkout = ref(false);
const editedWorkout = ref<Template>({
  id: null,
  name: "",
  category: 0,
  workout_exercises: [],
});

const newExercise = ref({
  name: "",
  description: "",
  body_part: null as BodyPart | null,
  weight_type: null as WeightType | null,
});

const bodyParts = getBodyPartOptions();
const weightTypes = getWeightTypeOptions();

// Computed properties
const filteredExercises = computed(() => {
  let exercises = exerciseStore.exercises.filter((ex) =>
    editedWorkout.value.workout_exercises.every(
      (we) => we.exercise.id !== ex.id,
    ),
  );

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
      other: BodyPart.Other,
    };
    exercises = exercises.filter(
      (ex) => ex.body_part === bodyPartMap[bodyPartTab.value],
    );
  }

  return exercises;
});

const isValid = computed(() => {
  return (
    newExercise.value.name?.trim()
    && newExercise.value.body_part !== null
    && newExercise.value.weight_type !== null
  );
});

// Methods
function weightTypeLabel(type: number) {
  return getWeightTypeLabel(type as WeightType);
}

function bodyPartLabel(part: number) {
  return getBodyPartLabel(part as BodyPart);
}

function loadTemplate() {
  editedWorkout.value = JSON.parse(JSON.stringify(props.template));
  if (!editedWorkout.value.id) {
    nameFocused.value = true;
    isNewWorkout.value = true;
  }
}

function dragStart() {
  isDragging.value = true;
}

function dragEnd() {
  isDragging.value = false;
}

function removeExercise(index: number) {
  editedWorkout.value.workout_exercises.splice(index, 1);
  updateExerciseRanks();
  markChanges();
}

function handleExerciseReorder() {
  updateExerciseRanks();
  markChanges();
}

function updateExerciseRanks() {
  editedWorkout.value.workout_exercises.forEach((ex, index) => {
    ex.rank = index + 1;
  });
}

function markChanges() {
  hasChanges.value = true;
}

async function saveChanges() {
  const payload = {
    name: editedWorkout.value.name,
    category: editedWorkout.value.category,
    workout_exercises: editedWorkout.value.workout_exercises.map((we) => ({
      exercise: we.exercise.id,
      rank: we.rank,
    })),
  };

  try {
    if (isNewWorkout.value) {
      const workout = await workoutTemplateService.createWorkoutTemplate(payload);
      hasChanges.value = false;

      const newWorkout = {
        ...editedWorkout.value,
        id: workout.id,
      };
      emit("new", newWorkout);
    }
    else {
      await workoutTemplateService.updateWorkoutTemplate(editedWorkout.value.id!, payload);
      hasChanges.value = false;
      emit("saved", editedWorkout.value);
    }
  }
  catch (error) {
    console.error("Error saving workout template:", error);
  }
}

function confirmDelete() {
  showDeleteDialog.value = true;
}

async function deleteTemplate() {
  try {
    await workoutTemplateService.deleteWorkoutTemplate(editedWorkout.value.id!);
    emit("close");
  }
  catch (error) {
    console.error("Error deleting template:", error);
  }
}

function cloneExercise(exercise: Exercise): WorkoutExercise {
  return {
    exercise: { ...exercise },
    rank: editedWorkout.value.workout_exercises.length + 1,
  };
}

function handleDragStart(event: DragEvent, exercise: Exercise) {
  event.dataTransfer!.setData("application/json", JSON.stringify(exercise));
  isDragging.value = true;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  try {
    const exercise = JSON.parse(event.dataTransfer!.getData("application/json"));
    const newExercise = cloneExercise(exercise);
    editedWorkout.value.workout_exercises.push(newExercise);
    markChanges();
  }
  catch (e) {
    console.error("Drop failed:", e);
  }
}

async function addNewExercise() {
  try {
    isAddingExercise.value = true;

    const exerciseData = {
      user: authStore.user?.id,
      name: newExercise.value.name,
      description: newExercise.value.description,
      body_part: newExercise.value.body_part!,
      weight_type: newExercise.value.weight_type!,
    };

    await exerciseService.createExercise(exerciseData);
    showExerciseDialog.value = false;
    resetNewExerciseForm();
  }
  catch (error) {
    console.error("Error creating exercise:", error);
  }
  finally {
    isAddingExercise.value = false;
  }
}

function resetNewExerciseForm() {
  newExercise.value = {
    name: "",
    description: "",
    body_part: null,
    weight_type: null,
  };
}

// Lifecycle hooks
onMounted(() => {
  exerciseService.fetchExercises();
  loadTemplate();
});

watch(
  () => props.template,
  () => {
    loadTemplate();
  },
);

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
</script>

<template>
  <div class="header-container">
    <h1 class="text-primary">
      Workout Edit
    </h1>
    <v-btn color="primary" @click="emit('close')">
      Done
    </v-btn>
  </div>

  <div class="workout-template-container">
    <!-- Left Card - Exercise Library -->
    <v-card class="exercise-library-card" elevation="2">
      <v-card-title class="py-3 bg-primary">
        <span class="text-h6 font-weight-bold">Exercise Library</span>
      </v-card-title>

      <div class="library-scroll-container">
        <v-card-text class="library-content">
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
              <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                size="large"
                class="create-btn"
                @click="showExerciseDialog = true"
              >
                Create Exercise
              </v-btn>
            </div>
          </div>

          <div class="drop-hint mb-4">
            <v-icon icon="mdi-hand-back-left" class="mr-2" />
            Drag exercises to workout
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

          <draggable
            :list="filteredExercises"
            :group="{ name: 'exercises', pull: 'clone', put: false }"
            item-key="id"
            :sort="false"
            :clone="cloneExercise"
            class="exercise-grid"
            @start="dragStart"
            @end="dragEnd"
          >
            <template #item="{ element }">
              <v-card
                class="exercise-card"
                draggable
                elevation="1"
                ripple
                @dragstart="(e: DragEvent) => handleDragStart(e, element)"
              >
                <v-card-text class="pa-3 d-flex">
                  <div class="avatar-wrapper-50">
                    <v-img
                      v-if="element.image_path"
                      :src="getExerciseImage(element.image_path)"
                      width="50"
                      height="50"
                      class="rounded"
                      contain
                    />
                    <v-avatar
                      v-else
                      size="50"
                      color="blue"
                      class="text-white font-weight-bold"
                    >
                      {{ element.name.charAt(0) }}
                    </v-avatar>
                  </div>

                  <div class="flex-grow-1">
                    <div class="exercise-header">
                      <div class="font-weight-bold text-body-1">
                        {{ element.name }}
                      </div>
                    </div>
                    <div class="text-caption text-grey mb-2">
                      {{ element.description || "No description" }}
                    </div>
                    <div class="exercise-meta d-flex">
                      <v-chip
                        size="small"
                        variant="outlined"
                        color="primary"
                        class="mr-2"
                      >
                        {{ weightTypeLabel(element.weight_type) }}
                      </v-chip>
                      <v-chip size="small" variant="outlined" color="secondary">
                        {{ bodyPartLabel(element.body_part) }}
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </draggable>
        </v-card-text>
      </div>
    </v-card>

    <!-- Right Card - Workout Template -->
    <v-card class="workout-template-card" elevation="2">
      <!-- Header with editable name -->
      <div class="workout-header">
        <div class="header-content">
          <div class="name-container">
            <v-text-field
              v-model="editedWorkout.name"
              variant="plain"
              class="template-name"
              hide-details
              single-line
              :class="{ 'name-focused': nameFocused }"
              @input="markChanges"
              @focus="nameFocused = true"
              @blur="nameFocused = false"
              @keydown.enter="(e: any) => e.target.blur()"
            />
            <v-icon
              color="white"
              class="edit-icon"
              :class="{ 'edit-icon-visible': nameFocused }"
            >
              mdi-pencil
            </v-icon>
          </div>
        </div>
        <v-btn
          v-if="hasChanges"
          color="green"
          variant="elevated"
          prepend-icon="mdi-content-save"
          size="small"
          class="save-btn"
          @click="saveChanges"
        >
          Save Template and assign to client
        </v-btn>
        <v-menu v-if="!isNewWorkout" offset-y>
          <template #activator="{ props }">
            <v-btn
              icon
              variant="text"
              color="grey"
              class="ml-2"
              v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="confirmDelete">
              <v-list-item-title class="error--text">
                <v-icon color="error" left>
                  mdi-delete
                </v-icon>
                Delete Template
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Exercises List -->
      <div class="exercises-scroll-container">
        <v-card-text class="workout-content">
          <div class="exercise-list">
            <draggable
              v-model="editedWorkout.workout_exercises"
              group="exercises"
              item-key="rank"
              class="exercise-draggable-list"
              @change="handleExerciseReorder"
            >
              <template #item="{ element: workoutExercise, index }">
                <v-card class="exercise-item" elevation="2">
                  <div class="exercise-item-content">
                    <div class="avatar-wrapper mr-3">
                      <v-img
                        v-if="workoutExercise.exercise.image_path"
                        :src="
                          getExerciseImage(workoutExercise.exercise.image_path)
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
                        {{ workoutExercise.exercise.name.charAt(0) }}
                      </v-avatar>
                    </div>

                    <div class="exercise-details">
                      <div class="exercise-header">
                        <span class="exercise-name font-weight-bold">
                          {{ workoutExercise.exercise.name }}
                        </span>
                      </div>

                      <div class="exercise-description text-caption text-grey">
                        {{
                          workoutExercise.exercise.description
                            || "No description"
                        }}
                      </div>

                      <div class="exercise-meta d-flex">
                        <v-chip
                          size="small"
                          variant="outlined"
                          color="primary"
                          class="mr-2"
                        >
                          {{
                            weightTypeLabel(
                              workoutExercise.exercise.weight_type,
                            )
                          }}
                        </v-chip>
                        <v-chip
                          size="small"
                          variant="outlined"
                          color="secondary"
                        >
                          {{
                            bodyPartLabel(workoutExercise.exercise.body_part)
                          }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="exercise-actions">
                      <div class="rank-circle">
                        {{ index + 1 }}
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        color="error"
                        size="small"
                        class="delete-btn"
                        @click.stop="removeExercise(index)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </template>
            </draggable>

            <!-- Persistent Drop Zone -->
            <div
              class="persistent-drop-zone"
              @dragover.prevent
              @drop="handleDrop($event)"
            >
              <div class="drop-content">
                <v-icon icon="mdi-plus" size="large" />
                <div>Drop exercises here to add</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </div>
    </v-card>

    <!-- Create Exercise Dialog -->
    <v-dialog v-model="showExerciseDialog" max-width="600">
      <v-card>
        <v-card-title>Create New Exercise</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addNewExercise">
            <v-text-field
              v-model="newExercise.name"
              label="Exercise Name"
              variant="outlined"
              required
              class="mb-3"
              :rules="[(v) => !!v || 'Exercise name is required']"
            />

            <v-text-field
              v-model="newExercise.description"
              label="Description"
              variant="outlined"
              class="mb-3"
            />

            <v-select
              v-model="newExercise.body_part"
              :items="bodyParts"
              label="Body Part"
              variant="outlined"
              required
              class="mb-3"
              :rules="[
                (v: number) =>
                  (v !== null && v !== undefined) || 'Body part is required',
              ]"
            />

            <v-select
              v-model="newExercise.weight_type"
              :items="weightTypes"
              label="Weight Type"
              variant="outlined"
              required
              class="mb-3"
              :rules="[
                (v: number) =>
                  (v !== null && v !== undefined) || 'Weight type is required',
              ]"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showExerciseDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isAddingExercise"
            :disabled="isAddingExercise || !isValid"
            @click="addNewExercise"
          >
            Create Exercise
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Delete Template?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ editedWorkout.name }}"? This
          action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" @click="deleteTemplate">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">
.workout-template-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 100%;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Shared card styles */
.exercise-library-card,
.workout-template-card {
  height: 80vh;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Left Card - Exercise Library */
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

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exercise-card {
  cursor: grab;
  transition: all 0.2s ease;
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

  &:active {
    cursor: grabbing;
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

/* Right Card - Workout Template */
.workout-template-card {
  .workout-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 24px;
    background: rgb(var(--v-theme-primary));
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .header-content {
      flex: 1;
      min-width: 0;
      max-width: 50%;
    }

    .name-container {
      display: flex;
      align-items: center;
      position: relative;

      .edit-icon {
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-left: 8px;
        font-size: 18px;
      }

      .edit-icon-visible {
        opacity: 1;
      }
    }

    .template-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      padding: 0;
      margin: -4px 0;

      :deep(.v-field__input) {
        padding: 0;
      }

      :deep(.v-field__field) {
        &::before,
        &::after {
          display: none;
        }
      }

      &.name-focused {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.3);
      }
    }

    .save-btn {
      align-self: center;
    }
  }

  .exercises-scroll-container {
    flex: 1;
    overflow-y: auto;
    position: relative;

    .workout-content {
      padding: 16px;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

.exercise-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.exercise-item {
  margin-bottom: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .exercise-item-content {
    display: flex;
    align-items: center;
    padding: 12px;
    position: relative;
  }

  .exercise-details {
    flex: 1;
    min-width: 0;
    padding-right: 12px;
  }

  .exercise-header {
    margin-bottom: 4px;
  }

  .exercise-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .exercise-description {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 8px;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .exercise-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-left: auto;
    padding-left: 12px;
  }

  .rank-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: rgb(var(--v-theme-primary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .delete-btn {
    margin-left: 0;
  }
}

.persistent-drop-zone {
  flex: 1;
  min-height: 100px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover,
  &.drag-over {
    background: rgba(var(--v-theme-primary), 0.08);
    border-color: rgba(var(--v-theme-primary), 0.5);
  }

  .drop-content {
    text-align: center;
    color: rgba(var(--v-theme-primary), 0.7);
    padding: 20px;

    .v-icon {
      margin-bottom: 8px;
      color: rgba(var(--v-theme-primary), 0.7);
    }
  }
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

/* Responsive Adjustments */
@media (max-width: 960px) {
  .exercise-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .avatar-wrapper {
    width: 60px;
    height: 60px;
    margin-right: 12px;
  }
}

@media (max-width: 600px) {
  .workout-header {
    flex-direction: column;
    gap: 12px;

    .save-btn {
      align-self: flex-start;
      margin-left: 0 !important;
    }
  }

  .exercise-grid {
    grid-template-columns: 1fr;
  }

  .exercise-item .v-card-text {
    padding: 12px;
  }

  .avatar-wrapper {
    width: 50px;
    height: 50px;
  }
}
</style>
