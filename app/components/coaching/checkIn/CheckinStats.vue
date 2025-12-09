<script setup lang="ts">
interface Props {
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
}

defineProps<Props>();
</script>

<template>
  <v-row class="stats-row mb-6">
    <v-col cols="12" sm="4">
      <v-card class="stat-card" color="green-lighten-5" flat>
        <div class="stat-content">
          <div class="stat-icon green">
            <v-icon>mdi-clipboard-check</v-icon>
          </div>
          <div>
            <div class="stat-number">
              {{ completedCount }}
            </div>
            <div class="stat-label">
              Completed
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="4">
      <v-card class="stat-card" color="blue-lighten-5" flat>
        <div class="stat-content">
          <div class="stat-icon blue">
            <v-icon>mdi-clock-outline</v-icon>
          </div>
          <div>
            <div class="stat-number">
              {{ pendingCount }}
            </div>
            <div class="stat-label">
              Pending
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="4">
      <v-card class="stat-card" color="red-lighten-5" flat>
        <div class="stat-content">
          <div class="stat-icon red">
            <v-icon>mdi-alert-circle-outline</v-icon>
          </div>
          <div>
            <div class="stat-number">
              {{ overdueCount }}
            </div>
            <div class="stat-label">
              Overdue
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  background-color: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
}

.stat-icon.green {
  background-color: rgba(76, 175, 80, 0.1);
  color: rgb(76, 175, 80);
}

.stat-icon.red {
  background-color: rgba(211, 47, 47, 0.1);
  color: rgb(211, 47, 47);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
