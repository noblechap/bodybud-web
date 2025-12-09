<script setup lang="ts">
import { useWorkoutTemplateService } from "~/composables/services/useWorkoutTemplateService";
import { useClientStore } from "~/store/clientStore";
import EditTemplateView from "./EditTemplateView.vue";
import WorkoutTemplateCard from "./WorkoutTemplateCard.vue";

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

interface WorkoutTemplate {
  id: number | null;
  name: string;
  category: number;
  workout_exercises: WorkoutExercise[];
}

interface WorkoutCategory {
  id: number;
  name: string;
  rank: number;
  workouts: WorkoutTemplate[];
}

const clientStore = useClientStore();
const workoutTemplateService = useWorkoutTemplateService();

const editDialog = ref(false);
const selectedTemplate = ref<WorkoutTemplate | null>(null);
const showNewCategoryDialog = ref(false);
const selectedCategoryType = ref<string | null>(null);
const customCategoryName = ref("");
const showDeleteDialog = ref(false);
const categoryToDelete = ref<WorkoutCategory | null>(null);

const suggestedCategories = [
  { label: "Push", value: "Push" },
  { label: "Pull", value: "Pull" },
  { label: "Legs", value: "Legs" },
  { label: "Upper", value: "Upper" },
  { label: "Lower", value: "Lower" },
];

const isCategoryValid = computed(() => {
  return (
    selectedCategoryType.value
    && (selectedCategoryType.value !== "custom" || customCategoryName.value.trim())
  );
});

async function createNewCategory() {
  try {
    const categoryName
      = selectedCategoryType.value === "custom"
        ? customCategoryName.value.trim()
        : selectedCategoryType.value;

    const payload = {
      name: categoryName!,
      rank: clientStore.workout_templates.length + 1,
    };

    await workoutTemplateService.createCategory(payload);

    // Reset form
    selectedCategoryType.value = null;
    customCategoryName.value = "";
    showNewCategoryDialog.value = false;
  }
  catch (error) {
    console.error("Error creating category:", error);
  }
}

function confirmDelete(category: WorkoutCategory) {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
}

async function deleteCategory() {
  if (!categoryToDelete.value)
    return;
  try {
    await workoutTemplateService.deleteCategory(categoryToDelete.value.id);
  }
  catch (error) {
    console.error("Error deleting category:", error);
  }
  finally {
    showDeleteDialog.value = false;
    categoryToDelete.value = null;
  }
}

function createWorkout(category: WorkoutCategory) {
  const newWorkout: WorkoutTemplate = {
    id: null,
    name: "New Workout",
    category: category.id,
    workout_exercises: [],
  };

  selectedTemplate.value = newWorkout;
  editDialog.value = true;
}

function openTemplate(template: WorkoutTemplate) {
  selectedTemplate.value = template;
  editDialog.value = true;
}

function handleClose() {
  selectedTemplate.value = null;
  editDialog.value = false;
}

function handleSaved(updatedTemplate: WorkoutTemplate) {
  handleClose();
  const templates = clientStore.workout_templates as unknown as WorkoutCategory[];
  templates.forEach((category) => {
    const templateIndex = category.workouts.findIndex(
      (t) => t.id === updatedTemplate.id,
    );
    if (templateIndex !== -1) {
      category.workouts[templateIndex] = updatedTemplate;
    }
  });
}

function handleNew(newTemplate: WorkoutTemplate) {
  handleClose();
  const templates = clientStore.workout_templates as unknown as WorkoutCategory[];
  templates.forEach((category) => {
    if (category.id === newTemplate.category) {
      category.workouts.push(newTemplate);
    }
  });
}

const sortedWorkoutTemplates = computed(() => {
  const templates = clientStore.workout_templates as unknown as WorkoutCategory[];
  return [...templates].sort((a, b) => a.rank - b.rank);
});
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div v-if="!editDialog">
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h5 text-md-h4 font-weight-bold text-primary">
            Workout Templates
          </h2>
        </div>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-plus"
          size="large"
          @click="showNewCategoryDialog = true"
        >
          New Category
        </v-btn>
      </div>

      <template v-if="clientStore.workout_templates.length > 0">
        <v-card
          v-for="category in sortedWorkoutTemplates"
          :key="category.id"
          class="mb-6 pa-4 pa-sm-6 rounded-xl"
          flat
          :border="true"
        >
          <div class="d-flex align-center mb-4">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2">
                mdi-folder-outline
              </v-icon>
              <h3 class="text-h6 font-weight-bold">
                {{ category.name }}
              </h3>
            </div>
            <v-spacer />
            <v-btn
              icon
              color="primary"
              size="x-small"
              class="mr-2"
              @click="createWorkout(category)"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-chip
              variant="flat"
              color="primary"
              size="small"
              class="text-white"
            >
              {{ category.workouts.length }} template{{
                category.workouts.length !== 1 ? "s" : ""
              }}
            </v-chip>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  color="grey"
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="confirmDelete(category)">
                  <v-list-item-title class="error--text">
                    <v-icon color="error" left>
                      mdi-delete
                    </v-icon>
                    Delete Category
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <v-divider class="mb-4" />

          <v-row class="g-4">
            <v-col
              v-for="template in category.workouts"
              :key="template.id || undefined"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <WorkoutTemplateCard
                :workout="template"
                class="h-100"
                @click="openTemplate(template)"
                @close="handleClose"
              />
            </v-col>
          </v-row>
        </v-card>
      </template>

      <v-slide-y-transition>
        <v-card
          v-if="clientStore.workout_templates.length === 0"
          flat
          color="grey-lighten-4"
          class="rounded-xl pa-8 text-center"
          style="border: none !important"
        >
          <v-icon size="64" color="primary" class="mb-4">
            mdi-dumbbell
          </v-icon>
          <h3 class="text-h6 mb-2">
            No Templates Created Yet
          </h3>
          <p class="text-medium-emphasis mb-4">
            Start building your own workout programs to streamline your
            training.
          </p>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-plus"
            size="large"
            @click="showNewCategoryDialog = true"
          >
            Create Your First Category
          </v-btn>
        </v-card>
      </v-slide-y-transition>
    </div>
    <div v-else>
      <EditTemplateView
        v-if="selectedTemplate"
        :template="selectedTemplate"
        @close="handleClose"
        @saved="handleSaved"
        @new="handleNew"
      />
    </div>
    <v-dialog v-model="showNewCategoryDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          Create New Category
        </v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedCategoryType">
            <v-radio
              v-for="category in suggestedCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
            <v-radio label="Custom" value="custom" />
          </v-radio-group>

          <v-text-field
            v-if="selectedCategoryType === 'custom'"
            v-model="customCategoryName"
            label="Category Name"
            variant="outlined"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showNewCategoryDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!isCategoryValid"
            @click="createNewCategory"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Delete Category?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this category? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" @click="deleteCategory">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card {
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.category-header {
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.empty-state-card {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.03),
    rgba(var(--v-theme-primary), 0.01)
  );
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
}
</style>
