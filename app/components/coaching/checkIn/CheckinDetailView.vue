<script setup lang="ts">
import type { CheckIn } from "~/types/checkIn";

interface Props {
  checkIn: CheckIn;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
}>();

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

function getStatus(): string {
  if (props.checkIn.completed_at)
    return "completed";
  if (isDateBeforeToday(props.checkIn.due_date))
    return "overdue";
  return "pending";
}

function getStatusColor(): string {
  const status = getStatus();
  return (
    {
      completed: "success",
      overdue: "error",
      pending: "info",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "grey"
  );
}

function getStatusIcon(): string {
  const status = getStatus();
  return (
    {
      completed: "mdi-check-circle",
      overdue: "mdi-alert-circle",
      pending: "mdi-clock",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "mdi-help-circle"
  );
}

function getStatusText(): string {
  const status = getStatus();
  return (
    {
      completed: "Completed",
      overdue: "Overdue",
      pending: "Pending",
    }[status as keyof { completed: string; overdue: string; pending: string }] || "Unknown"
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatItemType(type: string): string {
  const types: Record<string, string> = {
    TEXT: "Text",
    NUMBER: "Number",
    YES_NO: "Yes/No",
    PHOTO: "Photo",
    VIDEO: "Video",
  };
  return types[type] || type;
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
    TEXT: "mdi-text",
    NUMBER: "mdi-numeric",
    YES_NO: "mdi-checkbox-marked-circle-outline",
  };
  return icons[type] || "mdi-help-circle-outline";
}
</script>

<template>
  <div class="checkin-detail-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="d-flex align-center justify-space-between">
          <h1 class="text-h4 font-weight-bold">
            {{ checkIn.title || `Check-In #${checkIn.id}` }}
          </h1>
        </div>
        <div class="header-meta">
          <v-chip :color="getStatusColor()" size="small" class="status-chip mr-2">
            <v-icon start small>
              {{ getStatusIcon() }}
            </v-icon>
            {{ getStatusText() }}
          </v-chip>
          <div class="meta-item">
            <v-icon small class="mr-1">
              mdi-clock-outline
            </v-icon>
            <span>Due: {{ formatDate(checkIn.due_date) }}</span>
          </div>
          <div class="meta-item">
            <v-icon small class="mr-1">
              mdi-check
            </v-icon>
            <span>Completed: {{ formatDate(checkIn.completed_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <v-card class="description-card mb-6" elevation="2">
      <v-card-title class="text-subtitle-1 font-weight-medium section-title">
        <v-icon start color="primary">
          mdi-text
        </v-icon>
        Description
      </v-card-title>
      <v-divider class="mx-4" />
      <v-card-text class="text-body-1 pt-4">
        {{ checkIn.description || "No description provided" }}
      </v-card-text>
    </v-card>

    <!-- Responses Section -->
    <div class="responses-section">
      <div class="d-flex align-center mb-6">
        <v-icon size="32" color="primary" class="mr-2">
          mdi-comment-text-outline
        </v-icon>
        <h2 class="text-h5 font-weight-bold">
          Client Responses
        </h2>
      </div>

      <div v-if="checkIn.items.length > 0">
        <v-card
          v-for="item in checkIn.items"
          :key="item.id"
          class="response-item mb-6"
          elevation="2"
        >
          <v-card-text class="pa-5">
            <div class="response-header mb-4">
              <h3 class="text-subtitle-1 font-weight-medium question-text">
                {{ item.prompt }}
              </h3>
              <div class="response-meta">
                <v-chip
                  size="small"
                  :color="getItemTypeColor(item.item_type)"
                  class="mr-2 type-chip"
                >
                  <v-icon start small>
                    {{ getItemTypeIcon(item.item_type) }}
                  </v-icon>
                  {{ formatItemType(item.item_type) }}
                </v-chip>
                <v-chip
                  v-if="item.is_required"
                  size="small"
                  color="error"
                  class="required-chip"
                >
                  Required
                </v-chip>
              </div>
            </div>

            <div class="response-value">
              <!-- Show "Pending response" message if check-in is not completed -->
              <div v-if="!checkIn.completed_at" class="text-medium-emphasis text-body-1">
                Pending response from client
              </div>

              <!-- Show actual responses if check-in is completed -->
              <template v-else>
                <template v-if="item.item_type === 'TEXT'">
                  <div
                    v-if="item.text_response"
                    class="text-body-1 response-text pa-4 rounded-lg bg-grey-lighten-5"
                  >
                    {{ item.text_response }}
                  </div>
                  <div v-else class="text-medium-emphasis text-body-1">
                    No response provided
                  </div>
                </template>
                <template v-else-if="item.item_type === 'NUMBER'">
                  <div
                    v-if="item.number_response !== null && item.number_response !== undefined"
                    class="text-h6 response-text pa-4 primary--text bg-grey-lighten-5"
                  >
                    {{ item.number_response }}
                  </div>
                  <div v-else class="text-medium-emphasis text-body-1">
                    No response provided
                  </div>
                </template>
                <template v-else-if="item.item_type === 'YES_NO'">
                  <v-chip
                    v-if="item.yes_no_response !== null && item.yes_no_response !== undefined"
                    :color="item.yes_no_response ? 'success' : 'error'"
                    size="large"
                    class="px-4 answer-chip"
                  >
                    <v-icon start>
                      {{ item.yes_no_response ? "mdi-check" : "mdi-close" }}
                    </v-icon>
                    {{ item.yes_no_response ? "Yes" : "No" }}
                  </v-chip>
                  <div v-else class="text-medium-emphasis text-body-1">
                    No response provided
                  </div>
                </template>
                <template v-else-if="item.item_type === 'PHOTO'">
                  <div
                    v-if="item.photo_url"
                    class="d-flex justify-center media-container"
                  >
                    <v-img
                      :src="item.photo_url"
                      max-height="600"
                      contain
                      class="mt-2 mb-4 rounded-lg media-element"
                    />
                  </div>
                  <div v-else class="text-medium-emphasis text-body-1">
                    No photo submitted
                  </div>
                </template>
                <template v-else-if="item.item_type === 'VIDEO'">
                  <div
                    v-if="item.video_url"
                    class="d-flex justify-center media-container"
                  >
                    <video
                      :src="item.video_url"
                      controls
                      class="mt-2 mb-4 rounded-lg media-element"
                      style="max-width: 100%; max-height: 600px"
                    />
                  </div>
                  <div v-else class="text-medium-emphasis text-body-1">
                    No video submitted
                  </div>
                </template>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <v-card v-else class="empty-responses py-12" elevation="2">
        <div class="text-center">
          <v-icon size="72" color="grey-lighten-1">
            mdi-text-box-remove-outline
          </v-icon>
          <h3 class="text-h6 mt-4 text-grey-darken-1">
            No items in this check-in
          </h3>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.checkin-detail-view {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 32px;
}

.header-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.7);
}

.status-chip {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.description-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.description-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.section-title {
  padding-bottom: 12px;
}

.response-item {
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

.response-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.question-text {
  color: rgba(0, 0, 0, 0.87);
}

.response-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.type-chip {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.required-chip {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.answer-chip {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.response-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
  background-color: #fafafa;
}

.empty-responses {
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.02);
}

.media-container {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .response-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .response-meta {
    margin-top: 12px;
  }

  .description-card,
  .response-item {
    border-left-width: 3px;
  }
}
</style>
