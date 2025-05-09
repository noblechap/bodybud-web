<template>
  <div class="meal-plan-container">
    <!-- Left Card - Food Library -->
    <v-card class="food-library-card" elevation="2">
      <v-card-title class="py-3 bg-primary">
        <span class="text-h6 font-weight-bold">Food Library</span>
      </v-card-title>

      <div class="library-scroll-container">
        <v-card-text class="library-content">
          <v-tabs
            v-model="libraryTab"
            density="compact"
            class="library-tabs mb-4"
          >
            <v-tab value="foods">Add Foods</v-tab>
            <v-tab value="meals">Add Meals</v-tab>
          </v-tabs>

          <div v-if="libraryTab === 'foods'">
            <div class="search-container">
              <div class="search-wrapper">
                <v-text-field
                  v-model="foodSearch"
                  label="Search foods..."
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  density="comfortable"
                  @keyup.enter="searchFoods"
                  @click:clear="clearSearch"
                  hide-details
                  class="search-field"
                ></v-text-field>
                <v-btn
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="showFoodDialog = true"
                  size="large"
                  class="create-btn"
                >
                  Create Food
                </v-btn>
              </div>
            </div>

            <div class="drop-hint mb-4">
              <v-icon icon="mdi-hand-back-left" class="mr-2"></v-icon>
              Drag foods to meals
            </div>

            <draggable
              :list="searchResults.length > 0 ? searchResults : filteredFoods"
              :group="{ name: 'foods', pull: 'clone', put: false }"
              item-key="id"
              :sort="false"
              :clone="cloneFood"
              class="food-grid"
              @start="dragStart"
              @end="dragEnd"
              :scroll-sensitivity="100"
            >
              <template #item="{ element }">
                <v-card
                  class="food-card"
                  draggable
                  @dragstart="(e) => handleDragStart(e, element)"
                  elevation="1"
                  ripple
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex justify-space-between align-start mb-3">
                      <div class="food-info">
                        <div class="font-weight-bold text-body-1">
                          {{ element.name }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ element.description || "No description" }}
                        </div>
                      </div>
                      <v-icon icon="mdi-drag" class="drag-handle"></v-icon>
                    </div>

                    <div class="nutrition-facts">
                      <div class="nutrition-item">
                        <div class="nutrition-value">
                          {{ element.serving_size_g || element.serving_size }}g
                        </div>
                        <div class="nutrition-label">Serving</div>
                      </div>

                      <div class="nutrition-item calories">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              element.calories_per_g * element.serving_size,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Calories</div>
                      </div>

                      <div class="nutrition-item carbs">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              element.carbs_per_g * element.serving_size,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Carbs</div>
                      </div>

                      <div class="nutrition-item fats">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              element.fats_per_g * element.serving_size,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Fats</div>
                      </div>
                      <div class="nutrition-item protein">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              element.proteins_per_g * element.serving_size,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Protein</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </template>
            </draggable>
          </div>
          <div v-else>
            <div class="drop-hint mb-4">
              <v-icon icon="mdi-hand-back-left" class="mr-2"></v-icon>
              Drag and drop a meal to quickly add it
            </div>

            <div class="meal-templates-container">
              <v-card
                v-for="meal in coachStore.meals"
                :key="meal.id"
                draggable="true"
                @dragstart="(e) => handleMealDragStart(e, meal)"
                class="meal-card mb-4"
                elevation="2"
              >
                <v-card-title
                  class="meal-title d-flex justify-space-between align-center"
                >
                  <span class="meal-name">{{ meal.name }}</span>
                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        color="grey"
                        v-bind="props"
                        size="small"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="deleteMealTemplate(meal)">
                        <v-list-item-title class="error--text">
                          <v-icon color="error" left>mdi-delete</v-icon>
                          Delete Meal Template
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-title>

                <v-card-text class="food-items">
                  <div
                    v-for="(mealFood, index) in meal.meal_foods"
                    :key="mealFood.food.id"
                    class="food-item"
                  >
                    <div class="food-name">
                      {{ mealFood.food.name }}
                    </div>
                    <div class="food-details">
                      <span class="serving-size">
                        {{ mealFood.serving_size_g }}g
                      </span>
                      <span class="calories">
                        {{
                          Math.round(
                            mealFood.food.calories_per_g *
                              mealFood.serving_size_g,
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-chip small color="primary" class="mr-2">
                    {{ meal.meal_foods.length }} foods
                  </v-chip>
                  <v-chip small color="secondary">
                    {{ smartRound(calculateMealTotal(meal, "calories")) }}
                    calories
                  </v-chip>
                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-card-text>
      </div>
    </v-card>

    <!-- Right Card - Meal Plan -->
    <v-card class="meal-plan-card" elevation="2">
      <!-- Header with editable name and description -->
      <div class="meal-plan-header">
        <div class="header-content">
          <div class="name-container">
            <v-text-field
              v-model="editedMealPlan.name"
              variant="plain"
              class="plan-name"
              hide-details
              single-line
              @input="markChanges"
              @focus="nameFocused = true"
              @blur="nameFocused = false"
              @keydown.enter="(e) => e.target.blur()"
              :class="{ 'name-focused': nameFocused }"
            ></v-text-field>
            <v-icon
              color="white"
              class="edit-icon"
              :class="{ 'edit-icon-visible': nameFocused }"
            >
              mdi-pencil
            </v-icon>
          </div>
          <div class="name-container">
            <v-text-field
              v-model="editedMealPlan.description"
              variant="plain"
              class="plan-description"
              hide-details
              single-line
              @input="markChanges"
              placeholder="Add a description..."
              @focus="descFocused = true"
              @blur="descFocused = false"
              @keydown.enter="(e) => e.target.blur()"
              :class="{ 'desc-focused': descFocused }"
            ></v-text-field>
            <v-icon
              color="white"
              class="edit-icon"
              :class="{ 'edit-icon-visible': descFocused }"
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
          @click="saveChanges"
          size="small"
          class="add-meal-btn"
        >
          Save changes and assign meal plan
        </v-btn>
      </div>

      <!-- Food Goals Section -->
      <div class="goals-section pa-4">
        <v-row dense>
          <v-col cols="6" sm="4" md="2">
            <div class="nutrition-item servings">
              <div class="nutrition-value" style="opacity: 0.7">Meals/Day</div>
              <div class="text-h5 font-weight-bold">
                {{ editedMealPlan.planned_meals.length }}
              </div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2">
            <div class="nutrition-item calories">
              <div class="nutrition-value">Calories</div>
              <div class="d-flex align-center">
                <span class="text-h5 font-weight-bold">{{
                  smartRound(totalMacros.calories)
                }}</span>
              </div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2">
            <div class="nutrition-item carbs">
              <div class="nutrition-value">Carbs</div>
              <div class="text-h5 font-weight-bold">
                {{ smartRound(totalMacros.carbs) }}
              </div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2">
            <div class="nutrition-item fats">
              <div class="nutrition-value">Fat</div>
              <div class="text-h5 font-weight-bold">
                {{ smartRound(totalMacros.fats) }}
              </div>
            </div>
          </v-col>

          <v-col cols="6" sm="4" md="2">
            <div class="nutrition-item protein">
              <div class="nutrition-value">Protein</div>
              <div class="text-h5 font-weight-bold">
                {{ smartRound(totalMacros.proteins) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Meals List -->
      <div class="meals-scroll-container">
        <v-card-text class="meal-plan-content">
          <div class="meal-list">
            <div
              v-for="plannedMeal in editedMealPlan.planned_meals"
              :key="plannedMeal.rank"
              class="meal-card"
            >
              <div class="meal-header">
                <v-text-field
                  v-model="plannedMeal.meal.name"
                  variant="plain"
                  density="compact"
                  hide-details
                  @input="markChanges"
                  @keydown.enter="(e) => e.target.blur()"
                  class="meal-name"
                ></v-text-field>
                <div class="meal-nutrition-facts">
                  <div class="nutrition-item calories">
                    <div class="nutrition-value">
                      {{
                        smartRound(
                          calculateMealTotal(plannedMeal.meal, "calories"),
                        )
                      }}
                    </div>
                    <div class="nutrition-label">Calories</div>
                  </div>

                  <div class="nutrition-item carbs">
                    <div class="nutrition-value">
                      {{
                        smartRound(
                          calculateMealTotal(plannedMeal.meal, "carbs"),
                        )
                      }}
                    </div>
                    <div class="nutrition-label">Carbs</div>
                  </div>

                  <div class="nutrition-item fats">
                    <div class="nutrition-value">
                      {{
                        smartRound(calculateMealTotal(plannedMeal.meal, "fats"))
                      }}
                    </div>
                    <div class="nutrition-label">Fats</div>
                  </div>
                  <div class="nutrition-item protein">
                    <div class="nutrition-value">
                      {{
                        smartRound(
                          calculateMealTotal(plannedMeal.meal, "proteins"),
                        )
                      }}
                    </div>
                    <div class="nutrition-label">Protein</div>
                  </div>
                </div>

                <v-menu offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      color="grey"
                      v-bind="props"
                      class="ml-2"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item @click="saveMeal(plannedMeal)">
                      <v-list-item-title>
                        <v-icon color="primary" left>mdi-content-save</v-icon>
                        Save Meal
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeMeal(plannedMeal.rank)">
                      <v-list-item-title class="error--text">
                        <v-icon color="error" left>mdi-delete</v-icon>
                        Remove Meal
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <draggable
                v-model="plannedMeal.meal.meal_foods"
                group="foods"
                item-key="id"
                class="meal-foods-list"
                v-if="plannedMeal.meal.meal_foods.length"
                @add="handleAddToExistingMeal"
                @change="markChanges"
              >
                <template #item="{ element: mealFood }">
                  <div class="meal-food-item">
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div class="food-info">
                        <div class="font-weight-bold text-body-2">
                          {{ mealFood.food.name }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ mealFood.food.description || "No description" }}
                        </div>
                      </div>

                      <div class="food-actions">
                        <v-number-input
                          :min="0"
                          controlVariant="stacked"
                          :hideInput="false"
                          :inset="false"
                          density="compact"
                          suffix="g"
                          variant="solo"
                          @update:modelValue="markChanges"
                          @keydown.enter="(e) => e.target.blur()"
                          class="serving-size-input"
                          v-model.number="mealFood.serving_size_g"
                          :step="10"
                        ></v-number-input>
                        <v-btn
                          icon
                          variant="text"
                          color="error"
                          size="small"
                          @click="removeFood(plannedMeal, mealFood)"
                          class="ml-1"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <div class="nutrition-facts">
                      <div class="nutrition-item calories">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              mealFood.food.calories_per_g *
                                mealFood.serving_size_g,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Calories</div>
                      </div>

                      <div class="nutrition-item carbs">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              mealFood.food.carbs_per_g *
                                mealFood.serving_size_g,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Carbs</div>
                      </div>

                      <div class="nutrition-item fats">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              mealFood.food.fats_per_g *
                                mealFood.serving_size_g,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Fats</div>
                      </div>
                      <div class="nutrition-item protein">
                        <div class="nutrition-value">
                          {{
                            smartRound(
                              mealFood.food.proteins_per_g *
                                mealFood.serving_size_g,
                            )
                          }}
                        </div>
                        <div class="nutrition-label">Protein</div>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
              <div
                v-if="!plannedMeal.meal.meal_foods.length"
                class="empty-meal-drop-zone"
                @dragover.prevent
                @drop="handleDrop(plannedMeal, $event)"
              >
                <v-icon
                  icon="mdi-food-steak"
                  size="large"
                  class="mb-2"
                ></v-icon>
                <div>Drop foods here</div>
              </div>
            </div>
            <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-plus"
              @click="addMeal"
              size="large"
              class="create-btn"
              v-if="editedMealPlan.planned_meals.length < 8"
            >
              Add Meal
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </v-card>

    <v-dialog v-model="showFoodDialog" max-width="600">
      <v-card>
        <v-card-title>Create New Food</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addNewFood">
            <v-text-field
              v-model="newFood.name"
              label="Food Name"
              variant="outlined"
              required
              class="mb-3"
              :rules="[(v) => !!v || 'Food name is required']"
            ></v-text-field>

            <v-text-field
              v-model="newFood.description"
              label="Description"
              variant="outlined"
              required
              class="mb-3"
              :rules="[(v) => !!v || 'Description is required']"
            ></v-text-field>

            <div class="d-flex gap-4">
              <v-text-field
                v-model.number="newFood.serving_size"
                label="Serving Size (g)"
                type="number"
                variant="outlined"
                required
                min="1"
                class="mb-3"
                :rules="[(v) => v > 0 || 'Must be greater than 0']"
              ></v-text-field>

              <v-text-field
                v-model.number="newFood.calories_per_g"
                label="Calories"
                type="number"
                variant="outlined"
                required
                min="0"
                step="10"
                class="mb-3"
                :rules="[(v) => v >= 0 || 'Must be 0 or greater']"
              ></v-text-field>
            </div>

            <div class="d-flex gap-4">
              <v-text-field
                v-model.number="newFood.carbs_per_g"
                label="Carbs"
                type="number"
                variant="outlined"
                required
                min="0"
                step="10"
                class="mb-3"
                :rules="[(v) => v >= 0 || 'Must be 0 or greater']"
              ></v-text-field>

              <v-text-field
                v-model.number="newFood.fats_per_g"
                label="Fats"
                type="number"
                variant="outlined"
                required
                min="0"
                step="10"
                class="mb-3"
                :rules="[(v) => v >= 0 || 'Must be 0 or greater']"
              ></v-text-field>

              <v-text-field
                v-model.number="newFood.proteins_per_g"
                label="Protein"
                type="number"
                variant="outlined"
                required
                min="0"
                step="10"
                class="mb-3"
                :rules="[(v) => v >= 0 || 'Must be 0 or greater']"
              ></v-text-field>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showFoodDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            @click="addNewFood"
            :loading="isAddingFood"
          >
            Create Food
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useFoodStore } from "../../stores/foodStore";
import { useAuthStore } from "../../stores/auth";
import { useClientStore } from "../../stores/clientStore";
import { useCoachStore } from "../../stores/coachStore";
import draggable from "vuedraggable";
import { useToast } from "vue-toastification";
import { smartRound } from "../../utils/rounding";

const foodStore = useFoodStore();
const authStore = useAuthStore();
const clientStore = useClientStore();
const coachStore = useCoachStore();
const toast = useToast();

const createEmptyMealPlan = () => ({
  name: `${clientStore.username}'s meal plan`,
  description: "",
  planned_meals: Array.from(
    { length: clientStore.food_goals.meals_per_day },
    (_, i) => ({
      rank: i + 1,
      meal: {
        name: `Meal ${i + 1}`,
        meal_foods: [],
      },
    }),
  ),
});

// Reactive state
const hasChanges = ref(false);
const foodSearch = ref("");
const isDragging = ref(false);
const showFoodDialog = ref(false);
const libraryTab = ref("foods");
const isAddingFood = ref(false);
const searchResults = ref([]);
const nameFocused = ref(false);
const descFocused = ref(false);
const editedMealPlan = ref(
  clientStore.meal_plan
    ? JSON.parse(JSON.stringify(clientStore.meal_plan))
    : createEmptyMealPlan(),
);

const newFood = ref({
  name: "",
  description: "",
  serving_size: 100,
  calories_per_g: 0,
  proteins_per_g: 0,
  carbs_per_g: 0,
  fats_per_g: 0,
});

// Computed properties
const filteredFoods = computed(() => {
  if (!foodSearch.value) return foodStore.userFoods;
  const searchTerm = foodSearch.value.toLowerCase();
  return foodStore.userFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm) ||
      food.description.toLowerCase().includes(searchTerm),
  );
});

const totalMacros = computed(() => {
  return {
    proteins: calculateTotal("proteins"),
    carbs: calculateTotal("carbs"),
    fats: calculateTotal("fats"),
    calories: calculateTotal("calories"),
  };
});

// Methods
function calculateTotal(nutrient) {
  return editedMealPlan.value.planned_meals.reduce((total, plannedMeal) => {
    return total + calculateMealTotal(plannedMeal.meal, nutrient);
  }, 0);
}

function calculateMealTotal(meal, nutrient) {
  const nutrientKey = `${nutrient}_per_g`;
  return meal.meal_foods.reduce((total, mealFood) => {
    if (!mealFood?.food) return total;
    return total + mealFood.food[nutrientKey] * mealFood.serving_size_g;
  }, 0);
}

function dragStart() {
  isDragging.value = true;
}

function dragEnd() {
  isDragging.value = false;
}

function removeFood(meal, foodItem) {
  const index = meal.meal.meal_foods.findIndex(
    (mf) => mf.food.id === foodItem.food.id,
  );
  if (index > -1) {
    meal.meal.meal_foods.splice(index, 1);
    markChanges();
  }
}

function removeMeal(rank) {
  editedMealPlan.value.planned_meals =
    editedMealPlan.value.planned_meals.filter((m) => m.rank !== rank);
  // Re-rank remaining meals
  editedMealPlan.value.planned_meals.forEach((m, i) => {
    m.rank = i + 1;
  });
  markChanges();
}

function addMeal() {
  const newRank = editedMealPlan.value.planned_meals.length + 1;
  editedMealPlan.value.planned_meals.push({
    rank: newRank,
    meal: {
      name: `Meal ${newRank}`,
      meal_foods: [],
    },
  });
  markChanges();
}

function markChanges() {
  hasChanges.value = true;
}

function saveMeal(plannedMeal) {
  if (plannedMeal.meal.meal_foods.length === 0) {
    toast.error("Cannot save an empty meal");
    return;
  }

  try {
    const mealData = {
      name: plannedMeal.meal.name,
      meal_foods: plannedMeal.meal.meal_foods.map((mealFood) => ({
        food: mealFood.food.id,
        serving_size_g: mealFood.serving_size_g,
      })),
    };

    coachStore.createMeal(mealData);
    toast.success("Meal saved successfully");
  } catch (error) {
    console.error("Error saving meal:", error);
    toast.error("Failed to save meal");
  }
}

function saveChanges() {
  const updatedFoodGoals = {
    meals_per_day: editedMealPlan.value.planned_meals.length,
    carb_goal: Math.round(totalMacros.value.carbs),
    protein_goal: Math.round(totalMacros.value.proteins),
    fat_goal: Math.round(totalMacros.value.fats),
  };

  // Transform the meal plan data to match backend expectations
  const transformedMealPlan = {
    client: clientStore.clientId, // Make sure to pass clientId as prop
    name: editedMealPlan.value.name,
    description: editedMealPlan.value.description,
    planned_meals: editedMealPlan.value.planned_meals.map((plannedMeal) => {
      // For each planned meal, transform the structure
      const mealData = {
        name: plannedMeal.meal.name,
        meal_foods: plannedMeal.meal.meal_foods.map((mealFood) => ({
          food: mealFood.food.id, // Send just the food ID
          serving_size_g: mealFood.serving_size_g,
        })),
      };

      return {
        rank: plannedMeal.rank,
        meal_data: mealData,
      };
    }),
  };

  const payload = {
    meal_plan: transformedMealPlan,
    food_goals: updatedFoodGoals,
  };

  clientStore
    .updatePlan(clientStore.clientId, payload)
    .then(() => {
      toast.success("Meal plan updated successfully");
      hasChanges.value = false;
    })
    .catch((error) => {
      console.error("Error updating meal plan:", error);
      toast.error("Failed to update meal plan");
    });
  hasChanges.value = false;
}

async function addNewFood() {
  try {
    isAddingFood.value = true;

    // Prepare the food object in the required format
    let serving_size = newFood.value.serving_size;
    let calories_per_g = newFood.value.calories_per_g / serving_size;
    let carbs_per_g = newFood.value.carbs_per_g / serving_size;
    let proteins_per_g = newFood.value.proteins_per_g / serving_size;
    let fats_per_g = newFood.value.fats_per_g / serving_size;

    const foodData = {
      name: newFood.value.name,
      description: newFood.value.description,
      calories_per_g: parseFloat(calories_per_g).toFixed(4),
      carbs_per_g: parseFloat(carbs_per_g).toFixed(4),
      proteins_per_g: parseFloat(proteins_per_g).toFixed(4),
      fats_per_g: parseFloat(fats_per_g).toFixed(4),
      serving_size: parseInt(serving_size),
      serving_size_unit: "g",
      user: authStore.user.id,
    };

    // Call the foodStore to create the food
    await foodStore.saveFood(foodData);

    showFoodDialog.value = false;
    toast.success("Food created successfully");
    resetNewFoodForm();
  } catch (error) {
    console.error("Error creating food:", error);
    toast.error("Failed to create food");
  } finally {
    isAddingFood.value = false;
  }
}

function resetNewFoodForm() {
  newFood.value = {
    name: "",
    description: "",
    serving_size: 100,
    calories_per_g: 0,
    proteins_per_g: 0,
    carbs_per_g: 0,
    fats_per_g: 0,
  };
}

function cloneFood(food) {
  return {
    food: { ...food },
    serving_size_g: food.serving_size || 100,
  };
}

function addFoodToCollection(food) {
  // Check if from search results and not already in user foods
  if (
    searchResults.value.some((item) => item.id === food.id) &&
    !foodStore.userFoods.some((item) => item.id === food.id)
  ) {
    foodStore.userFoods.push({ ...food });
  }
}

function deleteMealTemplate(meal) {
  try {
    coachStore.deleteMeal(meal.id);
    toast.success("Meal template deleted successfully");
  } catch (error) {
    console.error("Error deleting meal template:", error);
    toast.error("Failed to delete meal template");
  }
}

function handleAddToExistingMeal(evt) {
  try {
    const food = JSON.parse(evt.item.dataset.json || "{}");
    if (food.id) {
      addFoodToCollection(food);
    }
  } catch (e) {
    console.error("Add to existing meal failed:", e);
  }
}

function handleDragStart(event, food) {
  event.dataTransfer.setData("application/json", JSON.stringify(food));
  event.currentTarget.dataset.json = JSON.stringify(food);
  isDragging.value = true;
}

const handleMealDragStart = (event, meal) => {
  event.dataTransfer.setData("application/json", JSON.stringify(meal));
  event.currentTarget.dataset.json = JSON.stringify(meal);
  isDragging.value = true;
};

function handleDrop(plannedMeal, event) {
  event.preventDefault();
  try {
    const data = JSON.parse(event.dataTransfer.getData("application/json"));
    if (data.meal_foods) {
      // This is a meal drop
      plannedMeal.meal.name = data.name;
      plannedMeal.meal.meal_foods = data.meal_foods.map((mealFood) => ({
        food: { ...mealFood.food },
        serving_size_g: mealFood.serving_size_g,
      }));
      markChanges();
    } else {
      addFoodToCollection(data);
      plannedMeal.meal.meal_foods.push({
        food: { ...data },
        serving_size_g: data.serving_size || 100,
      });
      markChanges();
    }
  } catch (e) {
    console.error("Drop failed:", e);
  }
}

const searchFoods = async () => {
  if (!foodSearch.value.trim()) return;

  try {
    await foodStore.searchFoods(foodSearch.value);
    if (foodStore.searchResults.length === 0) {
      toast.info("No foods found");
    } else {
      searchResults.value = foodStore.searchResults;
    }
  } catch (error) {
    console.error("Search failed:", error);
  }
};

const clearSearch = () => {
  foodSearch.value = "";
  searchResults.value = [];
};
</script>

<style scoped lang="scss">
.meal-plan-container {
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
.food-library-card,
.meal-plan-card {
  height: 80vh;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Left Card - Food Library */
.food-library-card {
  .library-scroll-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .library-content {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
  }

  .food-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 4px;
  }
}

/* Right Card - Meal Plan */
.meal-plan-card {
  .meal-plan-header {
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

    .plan-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      padding: 0px 0;
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

    .plan-description {
      font-size: 0.9rem;
      color: white;
      padding: 0px 0;
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

      &.desc-focused {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.3);
      }
    }

    .add-meal-btn {
      margin-left: 16px;
      align-self: center;
    }
  }

  .goals-section {
    flex-shrink: 0;
    padding: 16px;
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .meals-scroll-container {
    flex: 1;
    overflow-y: auto;

    .meal-plan-content {
      padding: 0 16px 16px 16px;
    }
  }

  .meal-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 16px;
  }
}

/* Meal Card styles */
.meal-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.meal-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;

  .meal-name {
    flex-grow: 1;
    min-width: 120px;

    :deep(.v-field__input) {
      font-size: 1.2rem;
      font-weight: 600;
    }
  }

  .meal-totals {
    display: flex;
    gap: 12px;
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.7);
    flex-wrap: wrap;

    .calories {
      font-weight: 500;
      color: #f44336;
    }
    .protein {
      color: #4caf50;
    }
    .carbs {
      color: #2196f3;
    }
    .fats {
      color: #ff9800;
    }
  }
}

.empty-meal-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.03);
  color: rgba(var(--v-theme-primary), 0.7);
  margin: 8px 0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.08);
    border-color: rgba(var(--v-theme-primary), 0.5);
  }
}

.meal-foods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-food-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    background: rgba(var(--v-theme-primary), 0.05);
    border-color: rgba(var(--v-theme-primary), 0.1);
  }
}

.food-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.serving-size-input {
  width: 110px;
  height: 40px;

  :deep(input) {
    text-align: right;
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
/* Food Card styles */
.food-card {
  cursor: grab;
  transition: all 0.2s ease;
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  }

  &:active {
    cursor: grabbing;
  }
}

.food-info {
  flex-grow: 1;
  min-width: 0;

  .text-body-1 {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .text-caption {
    line-height: 1.3;
  }
}

.drag-handle {
  opacity: 0.3;
  transition: opacity 0.2s ease;
  margin-left: 8px;
  color: rgba(var(--v-theme-primary), 0.8);

  &:hover {
    opacity: 1;
  }
}

/* Nutrition Facts styles */
.nutrition-facts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.meal-nutrition-facts {
  display: flex;
  gap: 8px;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  min-width: 50px;
  background: rgba(0, 0, 0, 0.03);

  .nutrition-value {
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.2;
  }

  .nutrition-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
    margin-top: 2px;
  }

  &.calories {
    background: rgba(244, 67, 54, 0.08);
    .nutrition-value {
      color: #f44336;
    }
  }
  &.protein {
    background: rgba(76, 175, 80, 0.08);
    .nutrition-value {
      color: #4caf50;
    }
  }
  &.carbs {
    background: rgba(33, 150, 243, 0.08);
    .nutrition-value {
      color: #2196f3;
    }
  }
  &.fats {
    background: rgba(255, 152, 0, 0.08);
    .nutrition-value {
      color: #ff9800;
    }
  }
}

/* Utility styles */
.drop-hint {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-primary));
  padding: 8px 12px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
}

@media (max-width: 768px) {
  .meal-plan-card {
    .meal-plan-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .add-meal-btn {
        margin-left: 0;
        align-self: flex-start;
      }
    }

    .meal-header {
      flex-wrap: wrap;

      .meal-totals {
        order: 3;
        width: 100%;
        margin-top: 8px;
        justify-content: flex-end;
      }
    }
  }
}

.goal-item {
  border-radius: 8px;
  background-color: rgba(var(--v-theme-primary), 0.03);
  height: 100%;
  padding: 8px;
}

@media (min-width: 1264px) {
  .v-col-md-2 {
    flex: 0 0 20%;
    max-width: 20%;
  }
}

.meal-templates-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  width: 100%;

  .meal-card {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    cursor: grab;
  }

  .meal-card:active {
    cursor: grabbing;
  }

  .meal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  }
  .meal-title {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0 0px 8px 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
  }

  .meal-name {
    flex-grow: 1;
  }

  .food-items {
    padding: 8px 0;
  }

  .food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .food-item:last-child {
    border-bottom: none;
  }

  .food-name {
    font-weight: 500;
    flex-grow: 1;
  }

  .food-details {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .serving-size {
    color: #666;
    font-size: 0.85rem;
    min-width: 50px;
    text-align: right;
  }

  .calories {
    font-weight: 600;
    color: var(--v-primary-base);
    min-width: 50px;
    text-align: right;
  }

  .drop-hint {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9rem;
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .meal-templates-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
