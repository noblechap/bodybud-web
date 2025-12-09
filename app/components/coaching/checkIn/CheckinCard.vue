<script setup lang="ts">
import type { CheckIn } from "~/types/checkIn";

interface Props {
  checkin: CheckIn;
}

defineProps<Props>();

function isDateBeforeToday(dateString: string | undefined): boolean {
  if (!dateString)
    return false;
  const dueDate = new Date(dateString);
  const today = new Date();

  return (
    dueDate.getFullYear() < today.getFullYear()
    || (dueDate.getFullYear() === today.getFullYear()
      && (dueDate.getMonth() < today.getMonth()
        || (dueDate.getMonth() === today.getMonth()
          && dueDate.getDate() < today.getDate())))
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatus(checkin: CheckIn): string {
  if (checkin.completed_at)
    return "completed";
  if (isDateBeforeToday(checkin.due_date))
    return "overdue";
  return "pending";
}

function getStatusColor(checkin: CheckIn): string {
  const status = getStatus(checkin);
  const colors = {
    completed: "green",
    overdue: "red",
    pending: "blue",
  };
  return colors[status as keyof typeof colors] || "grey";
}

function getStatusIcon(checkin: CheckIn): string {
  const status = getStatus(checkin);
  const icons = {
    completed: "mdi-check-circle",
    overdue: "mdi-alert-circle",
    pending: "mdi-clock",
  };
  return icons[status as keyof typeof icons] || "mdi-help-circle";
}
</script>

<template>
  <v-card
    class="checkin-card"
    variant="outlined"
  >
    <v-card-text>
      <div class="checkin-header">
        <div>
          <h3 class="text-h6">
            {{ checkin.title }}
          </h3>
          <p v-if="checkin.description" class="text-body-2 text-medium-emphasis mt-1">
            {{ checkin.description }}
          </p>
        </div>
        <v-chip
          :color="getStatusColor(checkin)"
          size="small"
        >
          <v-icon start small>
            {{ getStatusIcon(checkin) }}
          </v-icon>
          {{ getStatus(checkin) }}
        </v-chip>
      </div>
      <div class="checkin-meta mt-4">
        <div class="meta-item">
          <v-icon small>
            mdi-calendar
          </v-icon>
          <span>Due: {{ formatDate(checkin.due_date) }}</span>
        </div>
        <div v-if="checkin.completed_at" class="meta-item">
          <v-icon small>
            mdi-check
          </v-icon>
          <span>Completed: {{ formatDate(checkin.completed_at) }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.checkin-card {
  transition: all 0.2s ease;
}

.checkin-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.checkin-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
