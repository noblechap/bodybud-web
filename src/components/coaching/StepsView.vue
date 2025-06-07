<template>
  <div class="steps-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="stats-cards">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="primary">mdi-shoe-print</v-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(totalSteps) }}</div>
                <div class="stat-label">Total Steps</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="success">mdi-chart-line</v-icon>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(averageSteps) }}</div>
                <div class="stat-label">Daily Average</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="warning">mdi-target</v-icon>
              <div class="stat-info">
                <div class="stat-value">{{ goalAchievementRate }}%</div>
                <div class="stat-label">Goal Achievement</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="stat-content">
              <v-icon size="40" color="info">mdi-fire</v-icon>
              <div class="stat-info">
                <div class="stat-value">{{ currentStreak }}</div>
                <div class="stat-label">Current Streak</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Chart Section -->
    <v-card class="chart-section" elevation="2">
      <v-card-title>
        <span>Steps Progress</span>
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
            <v-btn :value="7">7 Days</v-btn>
            <v-btn :value="14">14 Days</v-btn>
            <v-btn :value="30">30 Days</v-btn>
          </v-btn-toggle>
        </div>
        <!-- Chart Controls - Centered above chart -->
        <div class="chart-controls-container">
          <div class="chart-controls">
            <v-btn
              icon
              size="small"
              variant="outlined"
              @click="scrollChart(-1)"
              :disabled="chartOffset === 0"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="chart-period-info">{{ getChartPeriodText() }}</span>
            <v-btn
              icon
              size="small"
              variant="outlined"
              @click="scrollChart(1)"
              :disabled="chartOffset >= maxChartOffset"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="chart-container" @wheel="handleChartScroll">
          <div class="chart-wrapper" ref="chartWrapper">
            <svg
              ref="chartSvg"
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
                  :y="
                    chartPadding.top + (chartInnerHeight / 5) * (5 - i + 1) + 5
                  "
                  text-anchor="end"
                  font-size="12"
                  fill="#666"
                >
                  {{ formatYAxisLabel((chartMaxValue / 5) * i) }}
                </text>
              </g>

              <!-- Goal line -->
              <g class="goal-line" v-if="visibleChartData.length > 0">
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
            <div class="legend-color achieved"></div>
            <span>Goal Achieved</span>
          </div>
          <div class="legend-item">
            <div class="legend-color close"></div>
            <span>Close to Goal</span>
          </div>
          <div class="legend-item">
            <div class="legend-color missed"></div>
            <span>Goal Missed</span>
          </div>
          <div class="legend-item">
            <div class="legend-line"></div>
            <span>Daily Goal</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Detailed Data Section -->
    <v-card class="data-section" elevation="2">
      <v-card-title>
        <span>Daily Steps Details</span>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="Search by date..."
          single-line
          hide-details
          density="compact"
          style="max-width: 300px"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="tableHeaders"
        :items="filteredStepsData"
        :items-per-page="10"
        class="elevation-0"
        item-value="id"
      >
        <template v-slot:item.date="{ item }">
          <div class="date-cell">
            <div class="date-primary">{{ formatDate(item.date) }}</div>
            <div class="date-secondary">{{ formatDayOfWeek(item.date) }}</div>
          </div>
        </template>

        <template v-slot:item.steps="{ item }">
          <div class="steps-cell">
            <v-chip
              :color="getStepsColor(item.steps, item.step_goal)"
              variant="tonal"
              size="small"
            >
              {{ formatNumber(item.steps) }}
            </v-chip>
          </div>
        </template>

        <template v-slot:item.step_goal="{ item }">
          <div class="goal-cell">
            {{ formatNumber(item.step_goal) }}
          </div>
        </template>

        <template v-slot:item.progress="{ item }">
          <div class="progress-cell">
            <v-progress-linear
              :model-value="getProgressPercentage(item.steps, item.step_goal)"
              :color="getProgressColor(item.steps, item.step_goal)"
              height="8"
              rounded
            ></v-progress-linear>
            <span class="progress-text">
              {{ getProgressPercentage(item.steps, item.step_goal) }}%
            </span>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.steps, item.step_goal)"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">{{
              getStatusIcon(item.steps, item.step_goal)
            }}</v-icon>
            {{ getStatusText(item.steps, item.step_goal) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
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
              <span class="detail-value">{{
                formatFullDate(selectedItem.date)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Steps Taken:</span>
              <span class="detail-value">{{
                formatNumber(selectedItem.steps)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Daily Goal:</span>
              <span class="detail-value">{{
                formatNumber(selectedItem.step_goal)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Progress:</span>
              <span class="detail-value"
                >{{
                  getProgressPercentage(
                    selectedItem.steps,
                    selectedItem.step_goal,
                  )
                }}%</span
              >
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <v-chip
                :color="
                  getStatusColor(selectedItem.steps, selectedItem.step_goal)
                "
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
                :class="
                  getDifferenceClass(selectedItem.steps, selectedItem.step_goal)
                "
              >
                {{
                  getDifferenceText(selectedItem.steps, selectedItem.step_goal)
                }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { storeToRefs } from "pinia";
import { useClientStore } from "../../stores/clientStore";

const clientStore = useClientStore();
const { steps, isLoading } = storeToRefs(clientStore);

// Reactive data
const searchQuery = ref("");
const detailsDialog = ref(false);
const selectedItem = ref(null);
const chartWrapper = ref(null);
const chartSvg = ref(null);
const chartOffset = ref(0);
const selectedDays = ref(14); // 🔹 Now user-controlled

// Chart dimensions
const chartHeight = 350;
const chartPadding = { top: 40, right: 80, bottom: 60, left: 60 };
const fullChartWidth = ref(800);
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
const sortedStepsData = computed(() => {
  if (!steps.value) return [];
  return [...steps.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const filteredStepsData = computed(() => {
  if (!searchQuery.value) return sortedStepsData.value;
  return sortedStepsData.value.filter((item) =>
    formatDate(item.date)
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase()),
  );
});

const totalSteps = computed(() => {
  return steps.value?.reduce((sum, item) => sum + item.steps, 0) || 0;
});

const averageSteps = computed(() => {
  if (!steps.value || steps.value.length === 0) return 0;
  return Math.round(totalSteps.value / steps.value.length);
});

const goalAchievementRate = computed(() => {
  if (!steps.value || steps.value.length === 0) return 0;
  const achievedGoals = steps.value.filter(
    (item) => item.steps >= item.step_goal,
  ).length;
  return Math.round((achievedGoals / steps.value.length) * 100);
});

const currentStreak = computed(() => {
  if (!steps.value || steps.value.length === 0) return 0;

  const sortedData = [...steps.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  let streak = 0;

  for (const item of sortedData) {
    if (item.steps >= item.step_goal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
});

const chartData = computed(() => {
  if (!steps.value) return [];
  return [...steps.value].sort((a, b) => new Date(a.date) - new Date(b.date));
});

const visibleChartData = computed(() => {
  const startIndex = chartOffset.value;
  return chartData.value.slice(startIndex, startIndex + selectedDays.value);
});

const maxChartOffset = computed(() => {
  return Math.max(0, chartData.value.length - selectedDays.value);
});

const chartMaxValue = computed(() => {
  if (!visibleChartData.value.length) return 10000;
  const maxSteps = Math.max(...visibleChartData.value.map((d) => d.steps));
  const maxGoal = Math.max(...visibleChartData.value.map((d) => d.step_goal));
  return Math.max(maxSteps, maxGoal) * 1.1;
});

const chartInnerWidth = computed(() => {
  return fullChartWidth.value - chartPadding.left - chartPadding.right;
});

const barWidth = computed(() => {
  if (!visibleChartData.value.length) return 0;
  const availableWidth = chartInnerWidth.value;
  return availableWidth / selectedDays.value;
});

// Methods
const formatNumber = (number) => new Intl.NumberFormat().format(number);

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const formatDayOfWeek = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", { weekday: "short" });

const formatFullDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getProgressPercentage = (steps, goal) => Math.round((steps / goal) * 100);

const getProgressColor = (steps, goal) => {
  const pct = (steps / goal) * 100;
  if (pct >= 100) return "success";
  if (pct >= 80) return "warning";
  return "error";
};

const getStepsColor = getProgressColor;
const getStatusColor = getProgressColor;

const getStatusIcon = (steps, goal) => {
  const pct = (steps / goal) * 100;
  if (pct >= 100) return "mdi-check-circle";
  if (pct >= 80) return "mdi-clock-outline";
  return "mdi-close-circle";
};

const getStatusText = (steps, goal) => {
  const pct = (steps / goal) * 100;
  if (pct >= 100) return "Achieved";
  if (pct >= 80) return "Close";
  return "Missed";
};

const getDifferenceText = (steps, goal) => {
  const diff = steps - goal;
  return diff >= 0
    ? `+${formatNumber(diff)} steps`
    : `${formatNumber(diff)} steps`;
};

const getDifferenceClass = (steps, goal) =>
  steps >= goal ? "text-success" : "text-error";

const showDetailsDialog = (item) => {
  selectedItem.value = item;
  detailsDialog.value = true;
};

const scrollChart = (direction) => {
  const newOffset = chartOffset.value + direction;
  if (newOffset >= 0 && newOffset <= maxChartOffset.value) {
    chartOffset.value = newOffset;
  }
};

const handleChartScroll = (event) => {
  event.preventDefault();
  const direction = event.deltaX > 0 ? 1 : -1;
  scrollChart(direction);
};

const getChartPeriodText = () => {
  if (!visibleChartData.value.length) return "No data";
  const start = formatDate(visibleChartData.value[0].date);
  const end = formatDate(
    visibleChartData.value[visibleChartData.value.length - 1].date,
  );
  return `${start} - ${end}`;
};

const getBarX = (index) => chartPadding.left + barWidth.value * index;

const getBarY = (steps) => {
  const ratio = steps / chartMaxValue.value;
  return chartPadding.top + chartInnerHeight - ratio * chartInnerHeight;
};

const getBarHeight = (steps) => {
  const ratio = steps / chartMaxValue.value;
  return ratio * chartInnerHeight;
};

const getBarColor = (steps, goal) => {
  const pct = (steps / goal) * 100;
  if (pct >= 100) return "#4caf50";
  if (pct >= 80) return "#ff9800";
  return "#f44336";
};

const getBarStrokeColor = (steps, goal) => {
  const pct = (steps / goal) * 100;
  if (pct >= 100) return "#388e3c";
  if (pct >= 80) return "#f57c00";
  return "#d32f2f";
};

const getGoalLinePath = () => {
  if (!visibleChartData.value.length) return "";
  return visibleChartData.value
    .map((item, index) => {
      const x = getBarX(index) + barWidth.value / 2;
      const y = getGoalLineY(item.step_goal);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const getGoalLineY = (goal) => {
  const ratio = goal / chartMaxValue.value;
  return chartPadding.top + chartInnerHeight - ratio * chartInnerHeight;
};

const formatYAxisLabel = (value) =>
  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);

const formatBarLabel = (steps) =>
  steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps.toString();

const formatDateForChart = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// Watchers
watch(visibleChartData, () => {
  /* reactive chart updates */
});

watch(selectedDays, () => {
  chartOffset.value = Math.max(0, chartData.value.length - selectedDays.value);
});

// Lifecycle
onMounted(async () => {
  await clientStore.fetchSteps();
  if (chartData.value.length > selectedDays.value) {
    chartOffset.value = Math.max(
      0,
      chartData.value.length - selectedDays.value,
    );
  }

  await nextTick();
  if (chartWrapper.value) {
    const containerWidth = chartWrapper.value.parentElement.clientWidth;
    fullChartWidth.value = Math.max(800, containerWidth - 40);
  }
});
</script>

<style scoped>
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
  color: #1976d2;
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
