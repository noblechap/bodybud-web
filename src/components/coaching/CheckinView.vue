<template>
  <div class="checkin-view">
    <!-- Main Header -->
    <div class="header-container">
      <div class="header-content">
        <h1 class="text-h4 font-weight-medium">Client Check-Ins</h1>
        <p class="text-body-1 text-medium-emphasis">
          Manage and review client submissions
        </p>
      </div>
      <v-btn
        color="primary"
        @click="showAssignDialog = true"
        prepend-icon="mdi-plus-circle-outline"
        size="large"
        class="assign-btn"
      >
        Assign New Check-In
      </v-btn>
    </div>

    <!-- Stats Overview -->
    <v-row class="stats-row mb-6">
      <v-col cols="12" sm="4">
        <v-card class="stat-card" color="green-lighten-5" flat>
          <div class="stat-content">
            <div class="stat-icon green">
              <v-icon>mdi-clipboard-check</v-icon>
            </div>
            <div>
              <div class="stat-number">{{ completedCheckins.length }}</div>
              <div class="stat-label">Completed</div>
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
              <div class="stat-number">{{ pendingCheckins.length }}</div>
              <div class="stat-label">Pending</div>
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
              <div class="stat-number">{{ overdueCheckins.length }}</div>
              <div class="stat-label">Overdue</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs Navigation -->
    <v-tabs v-model="activeTab" grow color="primary">
      <v-tab value="all">
        <v-icon left>mdi-view-dashboard</v-icon>
        All Check-Ins
      </v-tab>
      <v-tab value="completed">
        <v-icon left>mdi-check-circle</v-icon>
        Completed
      </v-tab>
      <v-tab value="pending">
        <v-icon left>mdi-clock</v-icon>
        Pending
      </v-tab>
      <v-tab value="overdue">
        <v-icon left>mdi-alert</v-icon>
        Overdue
      </v-tab>
    </v-tabs>

    <!-- Check-In Sections -->
    <div class="checkin-sections">
      <!-- All Check-Ins -->
      <div v-if="activeTab === 'all'" class="section-container">
        <div class="section-header">
          <h2 class="text-h5">All Check-Ins</h2>
          <v-text-field
            v-model="searchQuery"
            placeholder="Search check-ins..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            class="search-field"
          ></v-text-field>
        </div>
        <checkin-grid :checkins="filteredCheckins" @view="viewCheckinDetails" />
      </div>

      <!-- Completed Check-Ins -->
      <div v-if="activeTab === 'completed'" class="section-container">
        <div class="section-header">
          <h2 class="text-h5">Completed Check-Ins</h2>
          <v-chip color="green" variant="tonal" size="small">
            {{ completedCheckins.length }} total
          </v-chip>
        </div>
        <checkin-grid
          :checkins="completedCheckins"
          @view="viewCheckinDetails"
        />
      </div>

      <!-- Pending Check-Ins -->
      <div v-if="activeTab === 'pending'" class="section-container">
        <div class="section-header">
          <h2 class="text-h5">Pending Check-Ins</h2>
          <v-chip color="blue" variant="tonal" size="small">
            {{ pendingCheckins.length }} total
          </v-chip>
        </div>
        <checkin-grid :checkins="pendingCheckins" @view="viewCheckinDetails" />
      </div>

      <!-- Overdue Check-Ins -->
      <div v-if="activeTab === 'overdue'" class="section-container">
        <div class="section-header">
          <h2 class="text-h5">Overdue Check-Ins</h2>
          <v-chip color="red" variant="tonal" size="small">
            {{ overdueCheckins.length }} total
          </v-chip>
        </div>
        <checkin-grid :checkins="overdueCheckins" @view="viewCheckinDetails" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="activeCheckins.length === 0" class="empty-state">
      <v-icon size="80" color="grey-lighten-2"
        >mdi-text-box-search-outline</v-icon
      >
      <h3 class="text-h5 mt-4">No check-ins found</h3>
      <p class="text-body-1 text-medium-emphasis mb-4">
        {{
          activeTab === "all"
            ? "This client has no check-ins yet."
            : activeTab === "completed"
              ? "No completed check-ins found."
              : activeTab === "pending"
                ? "No pending check-ins found."
                : "No overdue check-ins found."
        }}
      </p>
      <v-btn
        color="primary"
        @click="showAssignDialog = true"
        prepend-icon="mdi-plus"
      >
        Assign New Check-In
      </v-btn>
    </div>

    <!-- Assign New Check-In Dialog -->
    <v-dialog v-model="showAssignDialog" max-width="800" scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>Assign New Check-In</v-toolbar-title>
          <v-btn icon="mdi-close" @click="showAssignDialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="assign-options">
            <v-card
              class="option-card scratch-card"
              @click="assignFromScratch"
              variant="outlined"
            >
              <div class="option-icon">
                <v-icon size="48" color="primary"
                  >mdi-file-document-edit-outline</v-icon
                >
              </div>
              <v-card-title class="text-h6">Create From Scratch</v-card-title>
              <v-card-text class="text-medium-emphasis">
                Build a custom check-in form with your own questions and
                requirements
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" variant="text" block>Select</v-btn>
              </v-card-actions>
            </v-card>

            <v-card
              class="option-card template-card"
              @click="showTemplateSelection = true"
              variant="outlined"
            >
              <div class="option-icon">
                <v-icon size="48" color="purple"
                  >mdi-clipboard-text-outline</v-icon
                >
              </div>
              <v-card-title class="text-h6">Use Template</v-card-title>
              <v-card-text class="text-medium-emphasis">
                Select from your existing templates to quickly assign a check-in
              </v-card-text>
              <v-card-actions>
                <v-btn color="purple" variant="text" block>Select</v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <!-- Template Selection -->
          <div
            v-if="showTemplateSelection"
            class="template-selection-container"
          >
            <h3 class="text-h6 mb-4">Select a Template</h3>

            <div
              v-if="coachStore.checkInTemplates.length === 0"
              class="empty-templates"
            >
              <v-icon size="64" color="grey-lighten-2"
                >mdi-clipboard-remove-outline</v-icon
              >
              <p class="text-body-1 text-medium-emphasis mt-4">
                No templates available.
              </p>
            </div>

            <div v-else class="template-list-container">
              <div class="template-list">
                <v-card
                  v-for="template in coachStore.checkInTemplates"
                  :key="template.id"
                  class="template-card"
                  :class="{
                    'selected-template': selectedTemplateId === template.id,
                  }"
                  @click="selectTemplate(template)"
                  variant="outlined"
                >
                  <div class="template-card-content">
                    <div class="template-icon">
                      <v-icon size="large" color="primary"
                        >mdi-clipboard-text-outline</v-icon
                      >
                    </div>
                    <div class="template-info">
                      <h4 class="text-subtitle-1 font-weight-medium">
                        {{ template.title }}
                      </h4>
                      <p
                        class="text-body-2 text-medium-emphasis template-description"
                      >
                        {{ template.description || "No description provided" }}
                      </p>
                    </div>
                    <div class="template-actions">
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        color="grey"
                        size="small"
                        @click.stop="promptDelete(template)"
                        class="delete-btn"
                      ></v-btn>
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        :icon="
                          selectedTemplateId === template.id
                            ? 'mdi-check'
                            : 'mdi-arrow-right'
                        "
                        :class="{
                          'selected-btn': selectedTemplateId === template.id,
                        }"
                      ></v-btn>
                    </div>
                  </div>
                </v-card>
              </div>

              <div class="template-selection-actions">
                <v-btn
                  color="primary"
                  :disabled="!selectedTemplateId"
                  @click="assignFromTemplate(selectedTemplate)"
                  block
                  size="large"
                >
                  Continue with Selected Template
                </v-btn>
                <v-btn
                  variant="text"
                  color="grey"
                  @click="showTemplateSelection = false"
                  class="mt-2"
                  block
                >
                  Cancel
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Delete Template?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ templateToDelete?.title }}"?
          <div class="text-caption text-medium-emphasis mt-2">
            This action cannot be undone.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteConfirm = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            @click="deleteTemplate"
            prepend-icon="mdi-delete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Check-In Detail Dialog -->
    <v-dialog v-model="showCheckinDetailDialog" max-width="800" scrollable>
      <v-card v-if="selectedCheckin">
        <v-toolbar :color="getStatusColor(selectedCheckin)" density="compact">
          <v-toolbar-title>
            {{ selectedCheckin.title || `Check-In #${selectedCheckin.id}` }}
          </v-toolbar-title>
          <v-btn
            icon="mdi-close"
            @click="showCheckinDetailDialog = false"
          ></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="detail-header mb-6">
            <div class="status-chip">
              <v-chip :color="getStatusColor(selectedCheckin)" size="small">
                <v-icon left small>{{ getStatusIcon(selectedCheckin) }}</v-icon>
                {{ getStatusText(selectedCheckin) }}
              </v-chip>
            </div>

            <div class="detail-meta">
              <div class="meta-item">
                <v-icon small>mdi-calendar</v-icon>
                <span>Due: {{ formatDate(selectedCheckin.due_date) }}</span>
              </div>
              <div v-if="selectedCheckin.completed_at" class="meta-item">
                <v-icon small>mdi-check</v-icon>
                <span
                  >Completed:
                  {{ formatDate(selectedCheckin.completed_at) }}</span
                >
              </div>
            </div>
          </div>

          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1">Description</v-card-title>
            <v-card-text>
              {{ selectedCheckin.description || "No description provided" }}
            </v-card-text>
          </v-card>

          <h3 class="text-h6 mb-4">Responses</h3>

          <div v-if="selectedCheckin.items.length > 0">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="(item, index) in selectedCheckin.items"
                :key="item.id"
                :title="item.prompt"
              >
                <template #text>
                  <div class="response-content">
                    <div class="response-meta">
                      <v-chip
                        size="small"
                        :color="getItemTypeColor(item.item_type)"
                        variant="tonal"
                      >
                        <v-icon left small>{{
                          getItemTypeIcon(item.item_type)
                        }}</v-icon>
                        {{ item.item_type }}
                      </v-chip>
                      <v-chip
                        v-if="item.is_required"
                        size="small"
                        color="red"
                        variant="tonal"
                        class="ml-2"
                      >
                        Required
                      </v-chip>
                    </div>

                    <div
                      v-if="selectedCheckin.completed_at"
                      class="response-value"
                    >
                      <template v-if="item.item_type === 'TEXT'">
                        <v-textarea
                          :model-value="
                            item.text_response || 'No response provided'
                          "
                          readonly
                          auto-grow
                          variant="outlined"
                          rows="3"
                        ></v-textarea>
                      </template>
                      <template v-else-if="item.item_type === 'NUMBER'">
                        <v-text-field
                          :model-value="item.number_response || 'N/A'"
                          readonly
                          variant="outlined"
                          type="number"
                        ></v-text-field>
                      </template>
                      <template v-else-if="item.item_type === 'YES_NO'">
                        <v-chip
                          :color="item.boolean_response ? 'green' : 'red'"
                          size="small"
                        >
                          {{ item.boolean_response ? "Yes" : "No" }}
                        </v-chip>
                      </template>
                      <template v-else-if="item.item_type === 'PHOTO'">
                        <v-img
                          v-if="item.photo_response_url"
                          :src="item.photo_response_url"
                          max-height="300"
                          contain
                          class="mt-2"
                        ></v-img>
                        <span v-else class="text-medium-emphasis"
                          >No photo submitted</span
                        >
                      </template>
                      <template v-else-if="item.item_type === 'VIDEO'">
                        <video
                          v-if="item.video_response_url"
                          :src="item.video_response_url"
                          controls
                          style="max-width: 100%; max-height: 300px"
                          class="mt-2"
                        ></video>
                        <span v-else class="text-medium-emphasis"
                          >No video submitted</span
                        >
                      </template>
                    </div>
                    <div v-else class="text-medium-emphasis">
                      Pending response from client
                    </div>
                  </div>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <div v-else class="text-medium-emphasis">
            No items in this check-in form
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showCheckinDetailDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Check-In Form Builder -->
    <v-dialog v-model="showFormBuilder" fullscreen scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            {{
              selectedTemplateForBuilder
                ? "Assign Check-In from Template"
                : "Create New Check-In"
            }}
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="handleCancelBuilder"></v-btn>
        </v-toolbar>
        <CheckinFormBuilder
          :template="selectedTemplateForBuilder"
          @close="handleCancelBuilder"
        />
      </v-card>
    </v-dialog>

    <!-- Check-In detailed view -->
    <v-dialog v-model="showCheckinDetailView" fullscreen scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title> Check-In Details </v-toolbar-title>
          <v-btn icon="mdi-close" @click="handleCloseDetailView"></v-btn>
        </v-toolbar>
        <CheckinDetailView
          :check-in="selectedCheckin"
          @close="handleCloseDetailView"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CheckinFormBuilder from "./CheckinFormBuilder.vue";
import CheckinDetailView from "./CheckinDetailView.vue";
import CheckinGrid from "./CheckinGrid.vue";
import { useCoachStore } from "../../stores/coachStore";
import { useClientStore } from "../../stores/clientStore";
import { useToast } from "vue-toastification";

const coachStore = useCoachStore();
const clientStore = useClientStore();
const toast = useToast();

// State
const activeTab = ref("all");
const searchQuery = ref("");
const showAssignDialog = ref(false);
const showTemplateSelection = ref(false);
const showFormBuilder = ref(false);
const showCheckinDetailDialog = ref(false);
const showCheckinDetailView = ref(false);
const selectedCheckin = ref(null);
const selectedTemplateForBuilder = ref(null);
const selectedTemplateId = ref(null);

const showDeleteConfirm = ref(false);
const templateToDelete = ref(null);

const selectedTemplate = computed(() => {
  return coachStore.checkInTemplates.find(
    (t) => t.id === selectedTemplateId.value,
  );
});

const selectTemplate = (template) => {
  if (selectedTemplateId.value === template.id) {
    selectedTemplateId.value = null;
    return;
  }
  selectedTemplateId.value = template.id;
};

const promptDelete = (template) => {
  templateToDelete.value = template;
  showDeleteConfirm.value = true;
};

const deleteTemplate = async () => {
  try {
    await coachStore.deleteCheckInTemplate(templateToDelete.value.id);
    toast.success("Template deleted successfully");
    selectedTemplateId.value = null;
  } catch (error) {
    toast.error("Failed to delete template");
  } finally {
    showDeleteConfirm.value = false;
    templateToDelete.value = null;
  }
};

// Computed properties
const completedCheckins = computed(() =>
  clientStore.client_checkins.filter((c) => c.completed_at),
);

const pendingCheckins = computed(() =>
  clientStore.client_checkins.filter(
    (c) => !c.completed_at && !isDateBeforeToday(c.due_date),
  ),
);

const overdueCheckins = computed(() =>
  clientStore.client_checkins.filter(
    (c) => !c.completed_at && isDateBeforeToday(c.due_date),
  ),
);

const isDateBeforeToday = (dateString) => {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();

  // Compare only year, month, and day
  return (
    dueDate.getFullYear() < today.getFullYear() ||
    (dueDate.getFullYear() === today.getFullYear() &&
      (dueDate.getMonth() < today.getMonth() ||
        (dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() < today.getDate())))
  );
};

const activeCheckins = computed(() => {
  switch (activeTab.value) {
    case "completed":
      return completedCheckins.value;
    case "pending":
      return pendingCheckins.value;
    case "overdue":
      return overdueCheckins.value;
    default:
      return clientStore.client_checkins;
  }
});

const filteredCheckins = computed(() => {
  if (!searchQuery.value) return activeCheckins.value;

  const query = searchQuery.value.toLowerCase();
  return activeCheckins.value.filter(
    (checkin) =>
      checkin.title?.toLowerCase().includes(query) ||
      checkin.description?.toLowerCase().includes(query) ||
      checkin.items.some((item) => item.prompt.toLowerCase().includes(query)),
  );
});

// Methods
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const viewCheckinDetails = async (checkin) => {
  selectedCheckin.value = checkin;
  if (checkin.completed_at) {
    if (hasMedia(checkin)) {
      try {
        const signed_checkin = await clientStore.fetchCheckin(checkin.id);
        selectedCheckin.value = signed_checkin;
      } catch (error) {
        toast.error("Failed to load check-in media");
      }
    }
    showCheckinDetailView.value = true;
  } else {
    showCheckinDetailDialog.value = true;
  }
};

function hasMedia(checkin) {
  return checkin.items?.some(
    (item) => item.item_type === "PHOTO" || item.item_type === "VIDEO",
  );
}

const assignFromScratch = () => {
  selectedTemplateForBuilder.value = null;
  showAssignDialog.value = false;
  showFormBuilder.value = true;
};

const assignFromTemplate = (template) => {
  selectedTemplateForBuilder.value = { ...template };
  showAssignDialog.value = false;
  showTemplateSelection.value = false;
  showFormBuilder.value = true;
};

const handleCancelBuilder = () => {
  console.log("Canceling form builder");
  showFormBuilder.value = false;
  selectedTemplateForBuilder.value = null;
};

const handleCloseDetailView = () => {
  showCheckinDetailView.value = false;
};

// Helper methods for UI
const getStatus = (checkin) => {
  if (checkin.completed_at) return "completed";
  if (isDateBeforeToday(checkin.due_date)) return "overdue";
  return "pending";
};

const getStatusColor = (checkin) => {
  const status = getStatus(checkin);
  return (
    {
      completed: "green",
      overdue: "red",
      pending: "blue",
    }[status] || "grey"
  );
};

const getStatusText = (checkin) => {
  const status = getStatus(checkin);
  return (
    {
      completed: "Completed",
      overdue: "Overdue",
      pending: "Pending",
    }[status] || "Unknown"
  );
};

const getStatusIcon = (checkin) => {
  const status = getStatus(checkin);
  return (
    {
      completed: "mdi-check-circle",
      overdue: "mdi-alert-circle",
      pending: "mdi-clock",
    }[status] || "mdi-help-circle"
  );
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
    TEXT: "mdi-text-box-outline",
    NUMBER: "mdi-numeric",
    YES_NO: "mdi-check-circle-outline",
  };
  return icons[type] || "mdi-help-circle-outline";
};
</script>

<style scoped>
.checkin-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h1 {
  margin-bottom: 4px;
}

.assign-btn {
  height: 48px;
}

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

.section-container {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-field {
  max-width: 300px;
  min-width: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.02);
  margin-top: 24px;
}

.assign-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.option-card {
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.option-icon {
  margin-bottom: 16px;
  color: inherit;
}

.scratch-card:hover {
  border-color: rgb(25, 118, 210);
}

.template-selection-container {
  padding: 16px 0;
}

.empty-templates {
  text-align: center;
  padding: 40px 0;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.template-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px;
  max-height: 400px;
}

.template-card {
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border-radius: 12px;
  cursor: pointer;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.template-card.selected-template {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.template-card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.template-icon {
  flex-shrink: 0;
  background-color: rgba(var(--v-theme-primary), 0.1);
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-info {
  flex-grow: 1;
  min-width: 0;
}

.template-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.delete-btn {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.template-card:hover .delete-btn {
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1 !important;
  color: rgb(var(--v-theme-error)) !important;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.selected-btn {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.template-selection-actions {
  flex-shrink: 0;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.empty-templates {
  text-align: center;
  padding: 40px 0;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-chip {
  align-self: flex-start;
}

.detail-meta {
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

.response-content {
  padding: 12px 0;
}

.response-meta {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.response-value {
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Custom scrollbar for dialogs */
.v-dialog .v-card {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.v-dialog .v-card::-webkit-scrollbar {
  width: 6px;
}

.v-dialog .v-card::-webkit-scrollbar-track {
  background: transparent;
}

.v-dialog .v-card::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .assign-btn {
    width: 100%;
  }

  .search-field {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .assign-options {
    grid-template-columns: 1fr;
  }

  .detail-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
