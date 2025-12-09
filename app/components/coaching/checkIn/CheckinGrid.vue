<script setup lang="ts">
import type { CheckIn } from "~/types/checkIn";

interface Props {
  checkins: CheckIn[];
}

defineProps<Props>();

const emit = defineEmits<{
  view: [checkin: CheckIn];
}>();

function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function getStatus(checkin: CheckIn): string {
  if (checkin.completed_at)
    return "completed";
  if (isDateBeforeToday(checkin.due_date))
    return "overdue";
  return "pending";
}

function getStatusColor(checkin: CheckIn): string {
  const status = getStatus(checkin);
  return (
    {
      completed: "#4CAF50",
      overdue: "#F44336",
      pending: "#2196F3",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "#9E9E9E"
  );
}

function getStatusChipColor(checkin: CheckIn): string {
  const status = getStatus(checkin);
  return (
    {
      completed: "green",
      overdue: "red",
      pending: "blue",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "grey"
  );
}

function getStatusText(checkin: CheckIn): string {
  const status = getStatus(checkin);
  return (
    {
      completed: "Completed",
      overdue: "Overdue",
      pending: "Pending",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "Unknown"
  );
}

function getStatusIcon(checkin: CheckIn): string {
  const status = getStatus(checkin);
  return (
    {
      completed: "mdi-check-circle",
      overdue: "mdi-alert-circle",
      pending: "mdi-clock",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "mdi-help-circle"
  );
}

function getCardClass(checkin: CheckIn): string {
  const status = getStatus(checkin);
  return (
    {
      completed: "completed-card",
      overdue: "overdue-card",
      pending: "pending-card",
    }[status as keyof { completed: string; overdue: string; pending: string }] || ""
  );
}

function getItemTypeColor(type: string): string {
  const colors: Record<string, string> = {
    PHOTO: "blue",
    VIDEO: "red",
    TEXT: "purple",
    NUMBER: "orange",
    YES_NO: "green",
  };
  return colors[type] || "grey";
}

function getItemTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    PHOTO: "mdi-camera",
    VIDEO: "mdi-video",
    TEXT: "mdi-text-box-outline",
    NUMBER: "mdi-numeric",
    YES_NO: "mdi-check-circle-outline",
  };
  return icons[type] || "mdi-help-circle-outline";
}
</script>

<template>
  <div class="checkin-grid">
    <v-row>
      <v-col
        v-for="checkin in checkins"
        :key="checkin.id"
        cols="12"
        sm="6"
        lg="4"
        xl="3"
      >
        <v-card
          class="checkin-card"
          :class="getCardClass(checkin)"
          @click="emit('view', checkin)"
        >
          <div class="card-header">
            <div
              class="card-status"
              :style="{ backgroundColor: getStatusColor(checkin) }"
            >
              <v-icon size="small" color="white">
                {{ getStatusIcon(checkin) }}
              </v-icon>
            </div>
            <div class="card-title">
              <h3>{{ checkin.title || `Check-In #${checkin.id}` }}</h3>
              <v-chip
                :color="getStatusChipColor(checkin)"
                size="x-small"
                variant="tonal"
                class="status-chip"
              >
                {{ getStatusText(checkin) }}
              </v-chip>
            </div>
          </div>

          <v-card-text class="card-content">
            <p class="description">
              {{ checkin.description || "No description provided" }}
            </p>

            <div class="meta-data">
              <div class="meta-item">
                <v-icon size="small">
                  mdi-calendar
                </v-icon>
                <span>Due: {{ formatDate(checkin.due_date) }}</span>
              </div>
              <div v-if="checkin.completed_at" class="meta-item">
                <v-icon size="small">
                  mdi-check
                </v-icon>
                <span>Completed: {{ formatDate(checkin.completed_at) }}</span>
              </div>
            </div>

            <div class="items-preview">
              <div
                v-for="item in checkin.items.slice(0, 3)"
                :key="item.id"
                class="preview-item"
              >
                <v-icon
                  size="small"
                  :color="getItemTypeColor(item.item_type)"
                  class="mr-1"
                >
                  {{ getItemTypeIcon(item.item_type) }}
                </v-icon>
                <span class="item-prompt">{{ item.prompt }}</span>
              </div>
              <div v-if="checkin.items.length > 3" class="more-items">
                +{{ checkin.items.length - 3 }} more items
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="card-actions">
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click.stop="emit('view', checkin)"
            >
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.checkin-grid {
  margin-top: 16px;
}

.checkin-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  border-left: 4px solid transparent;
  cursor: pointer;
}

.checkin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.completed-card {
  border-left-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.pending-card {
  border-left-color: #2196f3;
  background-color: rgba(33, 150, 243, 0.05);
}

.overdue-card {
  border-left-color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 16px 0 16px;
}

.card-status {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-title {
  flex-grow: 1;
  min-width: 0;
}

.card-title h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-chip {
  margin-top: 4px;
}

.card-content {
  padding: 16px;
  flex-grow: 1;
}

.description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-data {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.meta-item .v-icon {
  margin-right: 4px;
}

.items-preview {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
}

.preview-item {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  padding: 4px 0;
}

.item-prompt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.more-items {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  text-align: right;
  margin-top: 4px;
}

.card-actions {
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-status {
    margin-bottom: 8px;
  }
}
</style>
