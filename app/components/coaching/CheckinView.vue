<script setup lang="ts">
import type { CheckIn } from "~/types/checkIn";
import type { CheckInTemplate } from "~/types/models";

interface Props {
  checkins?: CheckIn[];
  clientId: number;
}

const props = withDefaults(defineProps<Props>(), {
  checkins: () => [],
  templates: () => [],
});

const { createQueryParamComputed } = useUrl();

const activeTab = createQueryParamComputed(
  "checkin-tab",
  ["all", "completed", "pending", "overdue"] as const,
  "all",
);
const searchQuery = ref("");
const showAssignDialog = ref(false);
const showCheckinDetailDialog = ref(false);
const showCheckinDetailView = ref(false);
const selectedCheckin = ref<CheckIn | null>(null);

function handleAssignCheckin() {
  showAssignDialog.value = true;
}

function handleAssignFromScratch() {
  navigateTo(`/coaching/client/${props.clientId}/checkin/new`);
}

function handleAssignFromTemplate(template: CheckInTemplate) {
  navigateTo(`/coaching/client/${props.clientId}/checkin/new?template=${template.id}`);
}

function handleViewCheckin(checkin: CheckIn) {
  selectedCheckin.value = checkin;
  if (checkin.completed_at) {
    showCheckinDetailView.value = true;
  }
  else {
    showCheckinDetailDialog.value = true;
  }
}

function handleCloseDetailView() {
  showCheckinDetailView.value = false;
  showCheckinDetailDialog.value = false;
  selectedCheckin.value = null;
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

const completedCheckins = computed(() =>
  props.checkins.filter((c) => c.completed_at),
);

const pendingCheckins = computed(() =>
  props.checkins.filter(
    (c) => !c.completed_at && !isDateBeforeToday(c.due_date),
  ),
);

const overdueCheckins = computed(() =>
  props.checkins.filter(
    (c) => !c.completed_at && isDateBeforeToday(c.due_date),
  ),
);

const filteredCheckins = computed(() => {
  if (!searchQuery.value)
    return props.checkins;

  const query = searchQuery.value.toLowerCase();
  return props.checkins.filter(
    (checkin) =>
      checkin.title?.toLowerCase().includes(query)
      || checkin.description?.toLowerCase().includes(query)
      || checkin.items.some((item) => item.prompt.toLowerCase().includes(query)),
  );
});

// Helper functions for dialogs
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

function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  <div class="checkin-view">
    <!-- Main Header -->
    <div class="header-container">
      <div class="header-content">
        <h2 class="text-h5 font-weight-medium">
          Client Check-Ins
        </h2>
        <p class="text-body-2 text-medium-emphasis">
          Manage and review client submissions
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus-circle-outline"
        size="large"
        @click="handleAssignCheckin"
      >
        Assign New Check-In
      </v-btn>
    </div>

    <!-- Stats Overview -->
    <CheckinStats
      :completed-count="completedCheckins.length"
      :pending-count="pendingCheckins.length"
      :overdue-count="overdueCheckins.length"
    />

    <!-- Tabs Navigation -->
    <v-tabs v-model="activeTab" grow color="primary">
      <v-tab value="all">
        <v-icon start>
          mdi-view-dashboard
        </v-icon>
        All Check-Ins
      </v-tab>
      <v-tab value="completed">
        <v-icon start>
          mdi-check-circle
        </v-icon>
        Completed
      </v-tab>
      <v-tab value="pending">
        <v-icon start>
          mdi-clock
        </v-icon>
        Pending
      </v-tab>
      <v-tab value="overdue">
        <v-icon start>
          mdi-alert
        </v-icon>
        Overdue
      </v-tab>
    </v-tabs>

    <!-- Tab Content Windows -->
    <v-tabs-window v-model="activeTab" class="checkin-sections">
      <!-- All Check-Ins -->
      <v-tabs-window-item value="all">
        <div class="section-container">
          <div class="section-header">
            <h2 class="text-h5">
              All Check-Ins
            </h2>
            <v-text-field
              v-model="searchQuery"
              placeholder="Search check-ins..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              class="search-field"
            />
          </div>
          <CheckinList
            v-if="filteredCheckins.length > 0"
            :checkins="filteredCheckins"
            @view="handleViewCheckin"
          />
          <CheckinEmptyState
            v-else
            tab="all"
            @assign-checkin="handleAssignCheckin"
          />
        </div>
      </v-tabs-window-item>

      <!-- Completed Check-Ins -->
      <v-tabs-window-item value="completed">
        <div class="section-container">
          <div class="section-header">
            <h2 class="text-h5">
              Completed Check-Ins
            </h2>
            <v-chip color="green" variant="tonal" size="small">
              {{ completedCheckins.length }} total
            </v-chip>
          </div>
          <CheckinList
            v-if="completedCheckins.length > 0"
            :checkins="completedCheckins"
            @view="handleViewCheckin"
          />
          <CheckinEmptyState
            v-else
            tab="completed"
            @assign-checkin="handleAssignCheckin"
          />
        </div>
      </v-tabs-window-item>

      <!-- Pending Check-Ins -->
      <v-tabs-window-item value="pending">
        <div class="section-container">
          <div class="section-header">
            <h2 class="text-h5">
              Pending Check-Ins
            </h2>
            <v-chip color="blue" variant="tonal" size="small">
              {{ pendingCheckins.length }} total
            </v-chip>
          </div>
          <CheckinList
            v-if="pendingCheckins.length > 0"
            :checkins="pendingCheckins"
            @view="handleViewCheckin"
          />
          <CheckinEmptyState
            v-else
            tab="pending"
            @assign-checkin="handleAssignCheckin"
          />
        </div>
      </v-tabs-window-item>

      <!-- Overdue Check-Ins -->
      <v-tabs-window-item value="overdue">
        <div class="section-container">
          <div class="section-header">
            <h2 class="text-h5">
              Overdue Check-Ins
            </h2>
            <v-chip color="red" variant="tonal" size="small">
              {{ overdueCheckins.length }} total
            </v-chip>
          </div>
          <CheckinList
            v-if="overdueCheckins.length > 0"
            :checkins="overdueCheckins"
            @view="handleViewCheckin"
          />
          <CheckinEmptyState
            v-else
            tab="overdue"
            @assign-checkin="handleAssignCheckin"
          />
        </div>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Assign Check-In Dialog -->
    <CheckinAssignDialog
      v-model="showAssignDialog"
      @assign-scratch="handleAssignFromScratch"
      @assign-template="handleAssignFromTemplate"
    />

    <!-- Check-In Detail Dialog (for NON-completed check-ins) -->
    <v-dialog v-model="showCheckinDetailDialog" max-width="800" scrollable>
      <v-card v-if="selectedCheckin">
        <v-toolbar :color="getStatusColor(selectedCheckin)" density="compact">
          <v-toolbar-title>
            {{ selectedCheckin.title || `Check-In #${selectedCheckin.id}` }}
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="handleCloseDetailView" />
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="detail-header mb-6">
            <div class="status-chip">
              <v-chip :color="getStatusColor(selectedCheckin)" size="small">
                <v-icon start small>
                  {{ getStatusIcon(selectedCheckin) }}
                </v-icon>
                {{ getStatusText(selectedCheckin) }}
              </v-chip>
            </div>

            <div class="detail-meta">
              <div class="meta-item">
                <v-icon small>
                  mdi-calendar
                </v-icon>
                <span>Due: {{ formatDate(selectedCheckin.due_date) }}</span>
              </div>
            </div>
          </div>

          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1">
              Description
            </v-card-title>
            <v-card-text>
              {{ selectedCheckin.description || "No description provided" }}
            </v-card-text>
          </v-card>

          <h3 class="text-h6 mb-4">
            Responses
          </h3>

          <div v-if="selectedCheckin.items.length > 0">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                v-for="item in selectedCheckin.items"
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
                        <v-icon start small>
                          {{ getItemTypeIcon(item.item_type) }}
                        </v-icon>
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

                    <div class="text-medium-emphasis mt-3">
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

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="handleCloseDetailView"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Check-In Detail View (for COMPLETED check-ins) -->
    <v-dialog v-model="showCheckinDetailView" max-width="1200" scrollable>
      <v-card v-if="selectedCheckin">
        <v-toolbar color="primary" density="compact" class="sticky-toolbar">
          <v-toolbar-title>Check-In Details</v-toolbar-title>
          <v-btn icon="mdi-close" @click="handleCloseDetailView" />
        </v-toolbar>
        <v-card-text class="pa-0">
          <CheckinDetailView
            :check-in="selectedCheckin"
            @close="handleCloseDetailView"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

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

.header-content h2 {
  margin-bottom: 4px;
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

.sticky-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-field {
    width: 100%;
    max-width: none;
  }

  .detail-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
