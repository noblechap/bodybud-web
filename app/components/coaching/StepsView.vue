<script setup lang="ts">
import type { StepData } from "~/types/client";
import { useStepsService } from "~/composables/services/useStepsService";
import { useClientStore } from "~/store/clientStore";

const clientStore = useClientStore();
const stepsService = useStepsService();

// Reactive data
const searchQuery = ref("");
const detailsDialog = ref(false);
const selectedItem = ref<StepData | null>(null);
const chartOffset = ref(0);
const selectedDays = ref(14);
const editDialog = ref(false);
const editedGoalValue = ref(0);
const isSavingGoal = ref(false);

// Chart dimensions
const chartHeight = 350;
const chartPadding = { top: 40, right: 80, bottom: 60, left: 60 };
const fullChartWidth = ref(1200);
const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

// Table headers
const tableHeaders = [
  { title: "Date", key: "date", sortable: true },
  { title: "Steps", key: "steps", sortable: true },
  { title: "Goal", key: "step_goal", sortable: true },
  { title: "Progress", key: "progress", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

// Computed properties
const sortedStepsData = computed(() =>
  [...clientStore.steps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
);

const filteredStepsData = computed(() => {
  if (!searchQuery.value)
    return sortedStepsData.value;
  return sortedStepsData.value.filter((item) =>
    formatDate(item.date)
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});

const totalSteps = computed(() =>
  clientStore.steps.reduce((sum, item) => sum + item.steps, 0),
);

const averageSteps = computed(() => {
  if (clientStore.steps.length === 0)
    return 0;
  return Math.round(totalSteps.value / clientStore.steps.length);
});

const goalAchievementRate = computed(() => {
  if (clientStore.steps.length === 0)
    return 0;
  const achievedGoals = clientStore.steps.filter(
    (item) => item.steps >= item.step_goal,
  ).length;
  return Math.round((achievedGoals / clientStore.steps.length) * 100);
});

const currentStreak = computed(() => {
  if (clientStore.steps.length === 0)
    return 0;

  const sortedData = [...clientStore.steps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  let streak = 0;

  for (const item of sortedData) {
    if (item.steps >= item.step_goal) {
      streak++;
    }
    else {
      break;
    }
  }

  return streak;
});

const chartData = computed(() =>
  [...clientStore.steps].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
);

const visibleChartData = computed(() => {
  const startIndex = chartOffset.value;
  return chartData.value.slice(startIndex, startIndex + selectedDays.value);
});

const maxChartOffset = computed(() =>
  Math.max(0, chartData.value.length - selectedDays.value),
);

const chartMaxValue = computed(() => {
  if (!visibleChartData.value.length)
    return 10000;
  const maxSteps = Math.max(...visibleChartData.value.map((d) => d.steps));
  const maxGoal = Math.max(...visibleChartData.value.map((d) => d.step_goal));
  return Math.max(maxSteps, maxGoal) * 1.1;
});

const chartInnerWidth = computed(() =>
  fullChartWidth.value - chartPadding.left - chartPadding.right,
);

const barWidth = computed(() => {
  if (!visibleChartData.value.length)
    return 0;
  return chartInnerWidth.value / selectedDays.value;
});

// Methods
function formatNumber(number: number): string {
  return new Intl.NumberFormat().format(number);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

function formatDayOfWeek(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { weekday: "short" });
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getProgressPercentage(steps: number, goal: number): number {
  return Math.round((steps / goal) * 100);
}

function getProgressColor(steps: number, goal: number): string {
  const pct = (steps / goal) * 100;
  if (pct >= 100)
    return "success";
  if (pct >= 80)
    return "warning";
  return "error";
}

function getStatusColor(steps: number, goal: number): string {
  return getProgressColor(steps, goal);
}

function getStatusIcon(steps: number, goal: number): string {
  const pct = (steps / goal) * 100;
  if (pct >= 100)
    return "mdi-check-circle";
  if (pct >= 80)
    return "mdi-clock-outline";
  return "mdi-close-circle";
}

function getStatusText(steps: number, goal: number): string {
  const pct = (steps / goal) * 100;
  if (pct >= 100)
    return "Achieved";
  if (pct >= 80)
    return "Close";
  return "Missed";
}

function getDifferenceText(steps: number, goal: number): string {
  const diff = steps - goal;
  return diff >= 0
    ? `+${formatNumber(diff)} steps`
    : `${formatNumber(diff)} steps`;
}

function getDifferenceClass(steps: number, goal: number): string {
  return steps >= goal ? "text-success" : "text-error";
}

function showDetailsDialog(item: StepData) {
  selectedItem.value = item;
  detailsDialog.value = true;
}

function getChartPeriodText(): string {
  if (!visibleChartData.value.length)
    return "No data";
  const start = formatDate(visibleChartData.value[0]!.date);
  const end = formatDate(visibleChartData.value[visibleChartData.value.length - 1]!.date);
  return `${start} - ${end}`;
}

function scrollChart(direction: number) {
  chartOffset.value = Math.max(0, Math.min(maxChartOffset.value, chartOffset.value + direction * selectedDays.value));
}

function getBarX(index: number): number {
  return chartPadding.left + barWidth.value * index;
}

function getBarY(steps: number): number {
  const ratio = steps / chartMaxValue.value;
  return chartPadding.top + chartInnerHeight - ratio * chartInnerHeight;
}

function getBarHeight(steps: number): number {
  const ratio = steps / chartMaxValue.value;
  return ratio * chartInnerHeight;
}

function getBarColor(steps: number, goal: number): string {
  const pct = (steps / goal) * 100;
  if (pct >= 100)
    return "#4caf50";
  if (pct >= 80)
    return "#ff9800";
  return "#f44336";
}

function getBarStrokeColor(steps: number, goal: number): string {
  const pct = (steps / goal) * 100;
  if (pct >= 100)
    return "#388e3c";
  if (pct >= 80)
    return "#f57c00";
  return "#d32f2f";
}

function getGoalLinePath(): string {
  if (!visibleChartData.value.length)
    return "";
  return visibleChartData.value
    .map((item, index) => {
      const x = getBarX(index) + barWidth.value / 2;
      const y = getGoalLineY(item.step_goal);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function getGoalLineY(goal: number): number {
  const ratio = goal / chartMaxValue.value;
  return chartPadding.top + chartInnerHeight - ratio * chartInnerHeight;
}

function formatYAxisLabel(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
}

function formatBarLabel(steps: number): string {
  return steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps.toString();
}

function formatDateForChart(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function openEditDialog() {
  if (clientStore.stepGoal.step_goal) {
    editedGoalValue.value = clientStore.stepGoal.step_goal;
    editDialog.value = true;
  }
}

function adjustGoal(amount: number) {
  const newValue = editedGoalValue.value + amount;
  if (newValue >= 1000 && newValue <= 20000) {
    editedGoalValue.value = newValue;
  }
}

async function saveStepGoal() {
  if (!editedGoalValue.value)
    return;

  try {
    isSavingGoal.value = true;
    await stepsService.updateStepGoal(editedGoalValue.value);
    editDialog.value = false;
  }
  catch (error) {
    console.error("Error updating step goal:", error);
  }
  finally {
    isSavingGoal.value = false;
  }
}

// Watchers
watch(selectedDays, () => {
  chartOffset.value = Math.max(0, chartData.value.length - selectedDays.value);
});

// Lifecycle
onMounted(async () => {
  if (clientStore.steps.length === 0) {
    await stepsService.loadSteps();
  }
  if (chartData.value.length > selectedDays.value) {
    chartOffset.value = Math.max(0, chartData.value.length - selectedDays.value);
  }
});
</script>

<template>
  <div class="steps-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="stats-cards">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="primary">
                mdi-shoe-print
              </v-icon>
              <div class="stat-info">
                <div class="stat-value">
                  {{ formatNumber(totalSteps) }}
                </div>
                <div class="stat-label">
                  Total Steps
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="success">
                mdi-chart-line
              </v-icon>
              <div class="stat-info">
                <div class="stat-value">
                  {{ formatNumber(averageSteps) }}
                </div>
                <div class="stat-label">
                  Daily Average
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="warning">
                mdi-target
              </v-icon>
              <div class="stat-info">
                <div class="stat-value">
                  {{ goalAchievementRate }}%
                </div>
                <div class="stat-label">
                  Goal Achievement
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="info">
                mdi-fire
              </v-icon>
              <div class="stat-info">
                <div class="stat-value">
                  {{ currentStreak }}
                </div>
                <div class="stat-label">
                  Current Streak
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Chart Section -->
    <v-card class="chart-section" elevation="2">
      <v-card-title>
        <div class="step-goal-wrapper">
          <span>Steps Progress</span>
          <v-btn
            color="grey-lighten-2"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-pencil"
            size="small"
            @click="openEditDialog"
          >
            <span class="text-h6">{{ formatNumber(clientStore.stepGoal?.step_goal || 0) }}</span>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <!-- Day selector toggle -->
        <div class="days-selector mb-4" style="text-align: center">
          <v-btn-toggle
            v-model="selectedDays"
            mandatory
            color="primary"
            variant="outlined"
            density="compact"
          >
            <v-btn :value="7">
              7 Days
            </v-btn>
            <v-btn :value="14">
              14 Days
            </v-btn>
            <v-btn :value="30">
              30 Days
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Chart Controls -->
        <div class="chart-controls-container">
          <div class="chart-controls">
            <v-btn
              :disabled="chartOffset === 0"
              icon
              size="small"
              variant="outlined"
              @click="scrollChart(-1)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="chart-period-info">{{ getChartPeriodText() }}</span>
            <v-btn
              :disabled="chartOffset >= maxChartOffset"
              icon
              size="small"
              variant="outlined"
              @click="scrollChart(1)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-wrapper">
            <svg
              :width="fullChartWidth"
              :height="chartHeight"
              class="chart-svg"
            >
              <!-- Background grid lines -->
              <g class="grid-lines">
                <line
                  v-for="i in 5"
                  :key="`grid-${i}`"
                  :x1="chartPadding.left"
                  :y1="chartPadding.top + (chartInnerHeight / 5) * i"
                  :x2="fullChartWidth - chartPadding.right"
                  :y2="chartPadding.top + (chartInnerHeight / 5) * i"
                  stroke="#f0f0f0"
                  stroke-width="1"
                />
              </g>

              <!-- Y-axis labels -->
              <g class="y-axis-labels">
                <text
                  v-for="i in 6"
                  :key="`y-label-${i}`"
                  :x="chartPadding.left - 10"
                  :y="chartPadding.top + (chartInnerHeight / 5) * (5 - i + 1) + 5"
                  text-anchor="end"
                  font-size="12"
                  fill="#666"
                >
                  {{ formatYAxisLabel((chartMaxValue / 5) * i) }}
                </text>
              </g>

              <!-- Goal line -->
              <g v-if="visibleChartData.length > 0" class="goal-line">
                <path
                  :d="getGoalLinePath()"
                  stroke="#ff9800"
                  stroke-width="2"
                  stroke-dasharray="5,5"
                  fill="none"
                />
              </g>

              <!-- Data bars -->
              <g class="data-bars">
                <g
                  v-for="(item, index) in visibleChartData"
                  :key="`bar-${item.id}`"
                  class="bar-group"
                >
                  <rect
                    :x="getBarX(index)"
                    :y="getBarY(item.steps)"
                    :width="barWidth"
                    :height="getBarHeight(item.steps)"
                    :fill="getBarColor(item.steps, item.step_goal)"
                    :stroke="getBarStrokeColor(item.steps, item.step_goal)"
                    stroke-width="1"
                    rx="4"
                    class="data-bar"
                    @click="showDetailsDialog(item)"
                  />

                  <!-- Bar value label -->
                  <text
                    :x="getBarX(index) + barWidth / 2"
                    :y="getBarY(item.steps) - 5"
                    text-anchor="middle"
                    font-size="11"
                    fill="#333"
                    font-weight="500"
                  >
                    {{ formatBarLabel(item.steps) }}
                  </text>

                  <!-- Date label -->
                  <text
                    :x="getBarX(index) + barWidth / 2"
                    :y="chartHeight - chartPadding.bottom + 15"
                    text-anchor="middle"
                    font-size="10"
                    fill="#666"
                  >
                    {{ formatDateForChart(item.date) }}
                  </text>

                  <!-- Day of week label -->
                  <text
                    :x="getBarX(index) + barWidth / 2"
                    :y="chartHeight - chartPadding.bottom + 28"
                    text-anchor="middle"
                    font-size="9"
                    fill="#999"
                  >
                    {{ formatDayOfWeek(item.date) }}
                  </text>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- Chart Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color achieved" />
            <span>Goal Achieved</span>
          </div>
          <div class="legend-item">
            <div class="legend-color close" />
            <span>Close to Goal</span>
          </div>
          <div class="legend-item">
            <div class="legend-color missed" />
            <span>Goal Missed</span>
          </div>
          <div class="legend-item">
            <div class="legend-line" />
            <span>Daily Goal</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Detailed Data Section -->
    <v-card class="data-section" elevation="2">
      <v-card-title>
        <span>Daily Steps Details</span>
        <v-spacer />
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="Search by date..."
          single-line
          hide-details
          density="compact"
          style="max-width: 300px"
        />
      </v-card-title>

      <v-data-table
        :headers="tableHeaders"
        :items="filteredStepsData"
        :items-per-page="10"
        class="elevation-0"
        item-value="id"
      >
        <template #[`item.date`]="{ item }">
          <div class="date-cell">
            <div class="date-primary">
              {{ formatDate(item.date) }}
            </div>
            <div class="date-secondary">
              {{ formatDayOfWeek(item.date) }}
            </div>
          </div>
        </template>

        <template #[`item.steps`]="{ item }">
          <div class="steps-cell">
            <v-chip
              :color="getProgressColor(item.steps, item.step_goal)"
              variant="tonal"
              size="small"
            >
              {{ formatNumber(item.steps) }}
            </v-chip>
          </div>
        </template>

        <template #[`item.step_goal`]="{ item }">
          <div class="goal-cell">
            {{ formatNumber(item.step_goal) }}
          </div>
        </template>

        <template #[`item.progress`]="{ item }">
          <div class="progress-cell">
            <v-progress-linear
              :model-value="getProgressPercentage(item.steps, item.step_goal)"
              :color="getProgressColor(item.steps, item.step_goal)"
              height="8"
              rounded
            />
            <span class="progress-text">
              {{ getProgressPercentage(item.steps, item.step_goal) }}%
            </span>
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.steps, item.step_goal)"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">
              {{ getStatusIcon(item.steps, item.step_goal) }}
            </v-icon>
            {{ getStatusText(item.steps, item.step_goal) }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="showDetailsDialog(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="500">
      <v-card v-if="selectedItem">
        <v-card-title>
          <span>Step Details - {{ formatDate(selectedItem.date) }}</span>
        </v-card-title>
        <v-card-text>
          <div class="details-content">
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ formatFullDate(selectedItem.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Steps Taken:</span>
              <span class="detail-value">{{ formatNumber(selectedItem.steps) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Daily Goal:</span>
              <span class="detail-value">{{ formatNumber(selectedItem.step_goal) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Progress:</span>
              <span class="detail-value">{{ getProgressPercentage(selectedItem.steps, selectedItem.step_goal) }}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <v-chip
                :color="getStatusColor(selectedItem.steps, selectedItem.step_goal)"
                variant="flat"
                size="small"
              >
                {{ getStatusText(selectedItem.steps, selectedItem.step_goal) }}
              </v-chip>
            </div>
            <div class="detail-row">
              <span class="detail-label">Difference:</span>
              <span
                class="detail-value"
                :class="getDifferenceClass(selectedItem.steps, selectedItem.step_goal)"
              >
                {{ getDifferenceText(selectedItem.steps, selectedItem.step_goal) }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="detailsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Step Goal Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title class="dialog-title">
          Edit Step Goal
        </v-card-title>
        <v-card-text class="dialog-content">
          <div class="current-goal-display">
            {{ formatNumber(editedGoalValue) }} steps
          </div>
          <div class="adjustment-controls">
            <v-btn
              :disabled="editedGoalValue <= 1000"
              large
              color="error"
              @click="adjustGoal(-1000)"
            >
              <span>
                <v-icon>mdi-minus</v-icon>
                1000
              </span>
            </v-btn>
            <v-btn
              :disabled="editedGoalValue >= 20000"
              large
              color="success"
              @click="adjustGoal(1000)"
            >
              <span>
                <v-icon>mdi-plus</v-icon>
                1000
              </span>
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn variant="text" color="grey" @click="editDialog = false">
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            :loading="isSavingGoal"
            color="primary"
            variant="flat"
            @click="saveStepGoal"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.step-goal-wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.dialog-title {
  padding: 20px 24px 10px;
  font-weight: 600;
  text-align: center;
}

.dialog-content {
  padding: 16px 24px;
  text-align: center;
}

.current-goal-display {
  font-size: 28px;
  font-weight: bold;
  margin: 20px 0;
  color: rgb(var(--v-theme-primary));
}

.adjustment-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.steps-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.chart-section {
  margin-bottom: 24px;
  border-radius: 12px;
}

.chart-controls-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-period-info {
  font-size: 14px;
  color: #666;
  min-width: 200px;
  text-align: center;
}

.chart-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #fafafa;
  width: 100%;
}

.chart-wrapper {
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chart-wrapper::-webkit-scrollbar {
  display: none;
}

.chart-svg {
  display: block;
  user-select: none;
  width: 100%;
  min-width: 800px;
}

.data-bar {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.data-bar:hover {
  opacity: 0.8;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-color.achieved {
  background-color: #4caf50;
}

.legend-color.close {
  background-color: #ff9800;
}

.legend-color.missed {
  background-color: #f44336;
}

.legend-line {
  width: 20px;
  height: 2px;
  background: linear-gradient(to right, #ff9800 50%, transparent 50%);
  background-size: 8px 2px;
  background-repeat: repeat-x;
}

.data-section {
  border-radius: 12px;
}

.date-cell {
  display: flex;
  flex-direction: column;
}

.date-primary {
  font-weight: 500;
}

.date-secondary {
  font-size: 12px;
  color: #666;
}

.steps-cell {
  display: flex;
  align-items: center;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 35px;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  font-weight: 500;
}

.text-success {
  color: #4caf50;
}

.text-error {
  color: #f44336;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .steps-view {
    padding: 10px;
  }
}
</style>
