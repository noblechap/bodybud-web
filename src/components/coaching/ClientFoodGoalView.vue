<template>
  <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
    <v-icon color="secondary" class="mr-3">mdi-food-apple</v-icon>
    <span class="text-h6">Meal Plan</span>
    <v-spacer></v-spacer>
    <v-btn
      color="primary"
      variant="text"
      size="small"
      prepend-icon="mdi-pencil"
      @click="openEditDialog"
    >
      Edit
    </v-btn>
  </v-card-title>

  <v-divider></v-divider>

  <v-card-text class="pa-4">
    <v-row dense>
      <v-col cols="6" sm="4" md="2">
        <div class="goal-item">
          <div class="text-caption text-medium-emphasis">Meals/Day</div>
          <div class="text-h5 font-weight-bold">
            {{ foodGoals.meals_per_day }}
          </div>
        </div>
      </v-col>

      <v-col cols="6" sm="4" md="2">
        <div class="goal-item">
          <div class="text-caption text-medium-emphasis">Calories</div>
          <div class="d-flex align-center">
            <v-icon size="20" color="orange-darken-3" class="mr-1"
              >mdi-fire</v-icon
            >
            <span class="text-h5 font-weight-bold">{{ totalCalories }}</span>
          </div>
        </div>
      </v-col>

      <v-col cols="6" sm="4" md="2">
        <div class="goal-item">
          <div class="text-caption text-medium-emphasis">Carbs</div>
          <div class="text-h5 font-weight-bold">
            {{ foodGoals.carb_goal }}<span class="text-body-2">g</span>
          </div>
        </div>
      </v-col>

      <v-col cols="6" sm="4" md="2">
        <div class="goal-item">
          <div class="text-caption text-medium-emphasis">Fat</div>
          <div class="text-h5 font-weight-bold">
            {{ foodGoals.fat_goal }}<span class="text-body-2">g</span>
          </div>
        </div>
      </v-col>

      <v-col cols="6" sm="4" md="2">
        <div class="goal-item">
          <div class="text-caption text-medium-emphasis">Protein</div>
          <div class="text-h5 font-weight-bold">
            {{ foodGoals.protein_goal }}<span class="text-body-2">g</span>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  foodGoals: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update-goals"]);

// Refs
const editDialog = ref(false);
const editedGoals = ref({ ...props.foodGoals });
const form = ref(null);

// Calorie constants
const CALORIES_PER_GRAM_CARB = 4;
const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_FAT = 9;

// Validation rules
const requiredRule = (v) => !!v || "Required";
const positiveNumberRule = (v) => v > 0 || "Must be positive";
const positiveIntegerRule = (v) =>
  (Number.isInteger(Number(v)) && v > 0) || "Must be a whole number";

// Computed properties
const carbCalories = computed(
  () => props.foodGoals.carb_goal * CALORIES_PER_GRAM_CARB,
);
const proteinCalories = computed(
  () => props.foodGoals.protein_goal * CALORIES_PER_GRAM_PROTEIN,
);
const fatCalories = computed(
  () => props.foodGoals.fat_goal * CALORIES_PER_GRAM_FAT,
);
const totalCalories = computed(
  () => carbCalories.value + proteinCalories.value + fatCalories.value,
);

const editedCarbCalories = computed(
  () => editedGoals.value.carb_goal * CALORIES_PER_GRAM_CARB,
);
const editedProteinCalories = computed(
  () => editedGoals.value.protein_goal * CALORIES_PER_GRAM_PROTEIN,
);
const editedFatCalories = computed(
  () => editedGoals.value.fat_goal * CALORIES_PER_GRAM_FAT,
);
const editedTotalCalories = computed(
  () =>
    editedCarbCalories.value +
    editedProteinCalories.value +
    editedFatCalories.value,
);

// Methods
const openEditDialog = () => {
  editedGoals.value = { ...props.foodGoals };
  editDialog.value = true;
};

const saveGoals = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  emit("update-goals", { ...editedGoals.value });
  editDialog.value = false;
};
</script>

<style scoped>
.goal-item {
  border-radius: 8px;
  background-color: rgba(var(--v-theme-primary), 0.03);
  height: 100%;
}

.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

@media (min-width: 1264px) {
  .v-col-md-2 {
    flex: 0 0 20%;
    max-width: 20%;
  }
}
</style>
