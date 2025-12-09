<script setup lang="ts">
import type { Performance, WorkoutHistory } from "~/types/client";

interface Props {
  workout: WorkoutHistory;
  usingPounds?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  usingPounds: true,
});

const weightUnit = computed(() => (props.usingPounds ? "lb" : "kg"));

function formattedDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}m ${sec}s`;
}

const sortedExercises = computed(() => {
  return [...props.workout.exercises].sort((a, b) => a.rank - b.rank);
});

function sortedSets(sets: Performance[]): Performance[] {
  return [...sets].sort((a, b) => a.rank - b.rank);
}

function formatNumber(num: number): string {
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
}

function formatSet(set: Performance, weightType: number): string {
  const weight = weightType === 3 ? set.weight * 2 : set.weight;
  return `${formatNumber(weight)} ${weightUnit.value} x ${set.reps} @ RPE ${set.rpe}`;
}

const totalWeight = computed(() => {
  const total = props.workout.exercises.reduce((acc, ex) => {
    return (
      acc
      + ex.performances.reduce((sum, perf) => {
        const multiplier = ex.exercise.weight_type === 3 ? 2 : 1;
        return sum + perf.weight * perf.reps * multiplier;
      }, 0)
    );
  }, 0);

  return formatNumber(total);
});

const prCount = computed(() => {
  return props.workout.exercises.reduce((count, ex) => {
    return count + ex.performances.filter((set) => set.pr).length;
  }, 0);
});
</script>

<template>
  <v-card class="pa-0 mb-6 workout-card" elevation="4" rounded="xl">
    <!-- Header Section with primary background -->
    <v-card-title class="d-flex bg-primary pa-4 pa-md-6">
      <div class="flex-grow-1" style="min-width: 0">
        <!-- CSS overflow hack -->
        <h3
          class="text-h6 text-lg-h5 font-weight-bold mb-1 text-white"
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        >
          {{ workout.name }}
        </h3>
        <p class="text-caption text-md-body-2 text-white text-lighten-2">
          {{ formattedDate(workout.date) }}
        </p>
      </div>
      <v-icon
        icon="mdi-dumbbell"
        size="28"
        color="white"
        class="flex-shrink-0"
      />
    </v-card-title>

    <!-- Content Section -->
    <v-card-text class="pa-0">
      <div class="pa-4 pa-md-6">
        <v-card-subtitle
          class="text-body-2 text-md-body-1 text-grey-darken-1 d-flex flex-wrap justify-space-between px-0"
        >
          <div class="d-flex align-center mb-2">
            <v-icon
              icon="mdi-clock-outline"
              size="20"
              class="mr-1 text-grey-darken-1"
            />
            <span>{{ formatDuration(workout.duration) }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon
              icon="mdi-weight"
              size="20"
              class="mr-1 text-grey-darken-1"
            />
            <span>{{ totalWeight }} {{ weightUnit }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon
              icon="mdi-trophy"
              :class="prCount > 0 ? 'text-amber' : 'text-grey-darken-1'"
              size="20"
              class="mr-1"
            />
            <span>{{ prCount }} PRs</span>
          </div>
        </v-card-subtitle>

        <v-divider class="my-4" />

        <div>
          <div
            v-for="exercise in sortedExercises"
            :key="exercise.exercise.id"
            class="mb-6"
          >
            <h4
              class="text-subtitle-1 text-lg-h6 font-weight-medium mb-2 text-grey-darken-3"
            >
              {{ exercise.exercise.name }}
            </h4>
            <div
              v-for="set in sortedSets(exercise.performances)"
              :key="set.rank"
              class="d-flex align-center mb-2"
            >
              <v-chip
                class="mr-2"
                size="small"
                color="primary"
                text-color="white"
              >
                {{ set.rank + 1 }}
              </v-chip>
              <div class="text-body-2 text-lg-body-1 text-grey-darken-2 mr-2">
                {{ formatSet(set, exercise.exercise.weight_type) }}
              </div>
              <v-icon
                v-if="set.pr"
                icon="mdi-trophy"
                color="amber"
                size="18"
              />
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.workout-card {
  overflow: hidden;
}

.v-card-title {
  border-radius: 12px 12px 0 0 !important;
}

.text-amber {
  color: #ffc107 !important;
}
</style>
