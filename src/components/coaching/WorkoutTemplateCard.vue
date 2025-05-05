<template>
  <v-card class="pa-0 rounded-xl" elevation="4">
    <!-- Header Section -->
    <div class="bg-primary pa-4 rounded-t-xl">
      <div class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-medium mb-0 text-white">
          {{ workout.name }}
        </h2>
      </div>
      <p class="text-caption text-white text-lighten-2 mb-0">
        Exercises in this workout
      </p>
    </div>

    <!-- Content Section -->
    <v-list class="pa-4">
      <v-list-item
        v-for="(item, index) in sortedExercises"
        :key="item.exercise.id"
        class="px-0"
      >
        <template #prepend>
          <div class="avatar-wrapper">
            <v-img
              v-if="item.exercise.image_path"
              :src="getExerciseImage(item.exercise.image_path)"
              width="50"
              height="50"
              class="rounded"
              contain
            />
            <v-avatar
              v-else
              size="40"
              color="blue"
              class="text-white font-weight-bold d-flex align-center justify-center"
            >
              {{ item.exercise.name.charAt(0) }}
            </v-avatar>
          </div>
        </template>

        <v-list-item-title
          class="font-weight-medium text-grey-darken-3 text-truncate"
        >
          {{ item.exercise.name }}
        </v-list-item-title>
        <v-list-item-subtitle
          class="text-grey-darken-1 text-caption text-truncate"
        >
          {{ item.exercise.description }}
        </v-list-item-subtitle>

        <template #append>
          <div class="rank-circle">{{ index + 1 }}</div>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  workout: Object,
});

const sortedExercises = computed(() =>
  [...props.workout.workout_exercises].sort((a, b) => a.rank - b.rank),
);

const getExerciseImage = (imageName) => {
  if (!imageName) return null;
  try {
    return new URL(
      `../../assets/exercises/${imageName}_right.png`,
      import.meta.url,
    ).href;
  } catch (e) {
    console.warn("Missing image:", imageName);
    return null;
  }
};
</script>

<style scoped>
.rank-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1976d2;
  color: white;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Smooth transition for hover effects */
.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}
</style>
