<script setup lang="ts">
import { useClientStore } from "~/store/clientStore";

const clientStore = useClientStore();
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center mb-4 mb-md-6">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-primary">
        Workout History
      </h2>
    </div>

    <template v-if="clientStore.workout_history.length > 0">
      <v-row class="history-grid" no-gutters>
        <v-col
          v-for="workout in clientStore.workout_history"
          :key="workout.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="pa-2"
        >
          <WorkoutHistoryCard
            :workout="workout"
            :using-pounds="clientStore.usingPounds"
            class="h-100"
          />
        </v-col>
      </v-row>
    </template>

    <v-slide-y-transition>
      <v-card
        v-if="clientStore.workout_history.length === 0"
        flat
        color="grey-lighten-4"
        class="rounded-xl pa-8 text-center"
      >
        <v-icon size="64" color="primary" class="mb-4">
          mdi-dumbbell
        </v-icon>
        <h3 class="text-h6 mb-2">
          No Workouts Recorded Yet
        </h3>
        <p class="text-medium-emphasis mb-4">
          Your completed workouts will appear here
        </p>
      </v-card>
    </v-slide-y-transition>
  </v-container>
</template>

<style scoped>
.history-grid {
  margin: -8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.v-card {
  transition: transform 0.2s ease;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>
