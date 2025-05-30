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
          <v-chip color="success" size="small" class="status-chip mr-2">
            <v-icon left small>mdi-check-circle</v-icon>
            Completed
          </v-chip>
          <div class="meta-item">
            <v-icon small class="mr-1">mdi-calendar</v-icon>
            <span>Assigned: {{ formatDate(checkIn.created_at) }}</span>
          </div>
          <div class="meta-item">
            <v-icon small class="mr-1">mdi-clock-outline</v-icon>
            <span>Due: {{ formatDate(checkIn.due_date) }}</span>
          </div>
          <div class="meta-item">
            <v-icon small class="mr-1">mdi-check</v-icon>
            <span>Completed: {{ formatDate(checkIn.completed_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <v-card class="description-card mb-6" elevation="2">
      <v-card-title class="text-subtitle-1 font-weight-medium section-title">
        <v-icon left color="primary">mdi-text</v-icon>
        Description
      </v-card-title>
      <v-divider class="mx-4"></v-divider>
      <v-card-text class="text-body-1 pt-4">
        {{ checkIn.description || "No description provided" }}
      </v-card-text>
    </v-card>

    <!-- Responses Section -->
    <div class="responses-section">
      <div class="d-flex align-center mb-6">
        <v-icon size="32" color="primary" class="mr-2"
          >mdi-comment-text-outline</v-icon
        >
        <h2 class="text-h5 font-weight-bold">Client Responses</h2>
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
                  <v-icon left small>{{
                    getItemTypeIcon(item.item_type)
                  }}</v-icon>
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
              <template v-if="item.item_type === 'TEXT'">
                <div
                  class="text-body-1 response-text pa-4 rounded-lg bg-grey-lighten-5"
                >
                  {{ item.text_response || "No response provided" }}
                </div>
              </template>
              <template v-else-if="item.item_type === 'NUMBER'">
                <div
                  class="text-h6 response-text pa-4 primary--text bg-grey-lighten-5"
                >
                  {{
                    item.number_response !== null ? item.number_response : "N/A"
                  }}
                </div>
              </template>
              <template v-else-if="item.item_type === 'YES_NO'">
                <v-chip
                  :color="item.yes_no_response ? 'success' : 'error'"
                  size="large"
                  class="px-4 answer-chip"
                >
                  <v-icon left>{{
                    item.yes_no_response ? "mdi-check" : "mdi-close"
                  }}</v-icon>
                  {{ item.yes_no_response ? "Yes" : "No" }}
                </v-chip>
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
                  ></v-img>
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
                  ></video>
                </div>
                <div v-else class="text-medium-emphasis text-body-1">
                  No video submitted
                </div>
              </template>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <v-card v-else class="empty-responses py-12" elevation="2">
        <div class="text-center">
          <v-icon size="72" color="grey-lighten-1"
            >mdi-text-box-remove-outline</v-icon
          >
          <h3 class="text-h6 mt-4 text-grey-darken-1">
            No items in this check-in
          </h3>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useClientStore } from "../../stores/clientStore";

const clientStore = useClientStore();
const isLoading = ref(false);

const props = defineProps({
  checkIn: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

// Formatting helpers
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatItemType = (type) => {
  const types = {
    TEXT: "Text",
    NUMBER: "Number",
    YES_NO: "Yes/No",
    PHOTO: "Photo",
    VIDEO: "Video",
  };
  return types[type] || type;
};

const getItemTypeColor = (type) => {
  const colors = {
    PHOTO: "blue",
    VIDEO: "red",
    TEXT: "purple",
    NUMBER: "orange",
    YES_NO: "green",
  };
  return colors[type] || "grey";
};

const getItemTypeIcon = (type) => {
  const icons = {
    PHOTO: "mdi-camera",
    VIDEO: "mdi-video",
    TEXT: "mdi-text",
    NUMBER: "mdi-numeric",
    YES_NO: "mdi-checkbox-marked-circle-outline",
  };
  return icons[type] || "mdi-help-circle-outline";
};
</script>

<style scoped>
.checkin-detail-view {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 32px;
}

.close-btn {
  position: absolute;
  right: 24px;
  top: 24px;
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
