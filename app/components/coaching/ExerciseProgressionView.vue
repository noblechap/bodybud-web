<script setup lang="ts">
import { Chart, registerables } from "chart.js";
import { useClientStore } from "~/store/clientStore";
import type { ExerciseProgression } from "~/types/client";
import { useClientService } from "~/composables/services/useClientService";

Chart.register(...registerables);

const clientStore = useClientStore();
const clientService = useClientService(); 
const toast = useToast();

const props = defineProps<{
  exerciseId?: number;
  exerciseName?: string;
  repCount?: number | null;
}>();

const emit = defineEmits<{
  returnToSelection: [];
}>();

// Refs
const timeframe = ref("month");
const search = ref("");
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartContainer = ref<HTMLElement | null>(null);
const volumeVisible = ref(false);
let chartInstance: Chart | null = null;


// Table headers for exercise progression
const headers = [
  { title: "Date", key: "date", width: "150px" },
  { title: "Weight", key: "weight", align: "end" as const },
  { title: "Reps", key: "reps", align: "center" as const },
  { title: "RPE", key: "rpe", align: "center" as const },
  { title: "PR", key: "pr", align: "center" as const },
  { title: "Set #", key: "set_rank", align: "center" as const },
];

// Weight formatting function
function formatWeight(weight: number | string | undefined): string {
  if (!weight) return "--";
  if (weight === "--") return "--";
  const weightNum = typeof weight === "string" ? parseFloat(weight) : weight;
  return weightNum.toFixed(1);
}

// Computed properties
const exerciseProgressionData = computed(() =>
  [...clientStore.exerciseProgression].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
);

const latestWeight = computed(() =>
  clientStore.exerciseProgression[0]?.weight || "--"
);

const latestReps = computed(() =>
  clientStore.exerciseProgression[0]?.reps || "--"
);

const latestRPE = computed(() =>
  clientStore.exerciseProgression[0]?.rpe || "--"
);

// Calculate 1RM using Epley formula: 1RM = weight × (1 + reps/30)
function calculateOneRM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

// Calculate volume (weight × reps)
function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

const thirtyDayChange = computed(() => {
  if (clientStore.exerciseProgression.length < 2) return "--";

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recent = clientStore.exerciseProgression[0];
  const pastEntry = clientStore.exerciseProgression.find(
    (ep) => new Date(ep.date) <= thirtyDaysAgo,
  );

  if (!recent || !pastEntry) return "--";

  const change = (recent.weight - pastEntry.weight).toFixed(1);
  return parseFloat(change) > 0 ? `+${change}` : change;
});

const thirtyDayChangeClass = computed(() => {
  if (thirtyDayChange.value === "--") return "";
  return thirtyDayChange.value.startsWith("+") ? "text-success" : "text-error";
});

const weeklyAverageWeight = computed(() => {
  if (clientStore.exerciseProgression.length === 0) return "--";

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentWeights = clientStore.exerciseProgression
    .filter((ep) => new Date(ep.date) >= sevenDaysAgo)
    .map((ep) => ep.weight);

  if (recentWeights.length === 0) return "--";

  const sum = recentWeights.reduce((a, b) => a + b, 0);
  return (sum / recentWeights.length).toFixed(1);
});

const maxWeightEver = computed(() => {
  if (clientStore.exerciseProgression.length === 0) return "--";
  return Math.max(...clientStore.exerciseProgression.map(ep => ep.weight)).toFixed(1);
});

// Methods
function formatTableDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRPEColor(rpe: number | undefined): string {
  if (!rpe) return "grey";
  if (rpe < 6) return "green-lighten-2";
  if (rpe < 8) return "blue-lighten-2";
  if (rpe < 9.5) return "orange-lighten-2";
  return "red-lighten-2";
}

function toggleVolume() {
  volumeVisible.value = !volumeVisible.value;
  initChart();
}

// Chart functions
function initChart() {
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // Filter data based on timeframe
  const now = new Date();
  const cutoffDate = new Date();

  switch (timeframe.value) {
    case "week":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      cutoffDate.setTime(0);
      break;
  }

  const filteredData = clientStore.exerciseProgression
    .filter((ep) => new Date(ep.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labels = filteredData.map((ep) =>
    new Date(ep.date).toLocaleDateString("en-US", {
      month: "short",
      day:
        timeframe.value === "year" || timeframe.value === "all"
          ? undefined
          : "numeric",
    }),
  );

  const weights = filteredData.map((ep) => ep.weight);
  const oneRMValues = filteredData.map((ep) => 
    calculateOneRM(ep.weight, ep.reps)
  );
  const volumeValues = filteredData.map((ep) =>
    calculateVolume(ep.weight, ep.reps)
  );

  // Create tooltip content
  const tooltipContent = filteredData.map((ep) => {
    return [
      `Weight: ${formatWeight(ep.weight)} lbs`,
      `Reps: ${ep.reps}`,
      `RPE: ${ep.rpe}`,
      `Volume: ${calculateVolume(ep.weight, ep.reps).toFixed(0)} lbs`,
      `Set #: ${ep.set_rank + 1}`
    ].join("\n");
  });

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Weight (lbs)",
          data: weights,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: "y",
        },
        {
          label: "Estimated 1RM",
          data: oneRMValues,
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: "y",
          borderDash: [5, 5],
        },
        {
          label: "Volume (lbs)",
          data: volumeVisible.value ? volumeValues : [],
          borderColor: "rgb(236, 72, 153)",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: "y1",
          hidden: !volumeVisible.value,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel: (context) => {
              const index = context.dataIndex;
              return tooltipContent[index];
            },
          },
        },
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Weight / 1RM (lbs)",
          },
        },
        y1: {
          type: "linear",
          display: volumeVisible.value,
          position: "right",
          title: {
            display: true,
            text: "Volume (lbs)",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });
}

// Load exercise progression data
async function loadExerciseProgression() {
  try {
    const exerciseId = props.exerciseId;
    const reps = props.repCount;
    
    if (!exerciseId || !reps) {
      console.warn("Missing exerciseId or repCount");
      return;
    }
    
    await clientService.loadClientExerciseProgression(
      clientStore.clientId ?? 0,
      exerciseId,
      reps
    );
  } catch (error) {
    console.error("Failed to load exercise progression:", error);
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (props.exerciseId && props.repCount) {
    let data = await loadExerciseProgression();
    if (clientStore.exerciseProgression.length === 0) {
      emit('returnToSelection');
      toast.error("No data found for the selected exercise and rep count.");
      return
    }
    nextTick().then(() => {
      initChart();
    });
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(timeframe, () => {
  initChart();
});
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center mb-6">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-primary">
        Exercise Progression Analytics
        <span v-if="exerciseName" class="text-h6 ml-2 text-medium-emphasis">
          - {{ exerciseName }} for {{ repCount }} reps
        </span>
      </h2>
    </div>

    <!-- Timeframe Selector -->
    <v-card flat class="mb-6">
      <v-card-text class="pa-0">
        <v-btn-toggle
          v-model="timeframe"
          mandatory
          color="primary"
          variant="outlined"
          divided
          class="timeframe-selector"
        >
          <v-btn value="week" size="large">
            <v-icon start>
              mdi-calendar-week
            </v-icon>
            Week
          </v-btn>
          <v-btn value="month" size="large">
            <v-icon start>
              mdi-calendar-month
            </v-icon>
            Month
          </v-btn>
          <v-btn value="year" size="large">
            <v-icon start>
              mdi-calendar-year
            </v-icon>
            Year
          </v-btn>
          <v-btn value="all" size="large">
            <v-icon start>
              mdi-calendar
            </v-icon>
            All Time
          </v-btn>
        </v-btn-toggle>
      </v-card-text>
    </v-card>

    <!-- Stats Overview -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">
              mdi-dumbbell
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Latest Weight
              </div>
              <div class="text-h5 font-weight-bold">
                {{ latestWeight ? formatWeight(latestWeight) : "--" }}
                <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">
              mdi-chart-line
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                30 Day 1RM Change
              </div>
              <div class="text-h5 font-weight-bold" :class="thirtyDayChangeClass">
                {{ thirtyDayChange }} <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">
              mdi-weight-lifter
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Max Weight Ever
              </div>
              <div class="text-h5 font-weight-bold">
                {{ maxWeightEver }} <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">
              mdi-trending-up
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Weekly Avg Weight
              </div>
              <div class="text-h5 font-weight-bold">
                {{ weeklyAverageWeight }} <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Interactive Chart -->
    <v-card class="mb-6 rounded-lg" elevation="2">
      <v-card-title class="pa-4 pb-2">
        <div class="text-h6">
          Progression Trend
        </div>
        <v-spacer />
        <v-chip
          v-if="volumeVisible"
          color="pink-lighten-5"
          variant="outlined"
          class="text-pink-darken-2"
          prepend-icon="mdi-eye-off"
          @click="toggleVolume"
        >
          Hide Volume
        </v-chip>
        <v-chip
          v-else
          color="indigo-lighten-5"
          variant="outlined"
          class="text-indigo-darken-2"
          prepend-icon="mdi-eye"
          @click="toggleVolume"
        >
          Show Volume
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <div ref="chartContainer" class="chart-container">
          <canvas ref="chartCanvas" />
        </div>
      </v-card-text>
    </v-card>

    <!-- Data Table -->
    <v-card class="rounded-lg" elevation="2">
      <v-card-title class="pa-4">
        <div class="text-h6">
          Exercise History
        </div>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          variant="outlined"
          density="compact"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="exerciseProgressionData"
        :search="search"
        :items-per-page="10"
        class="elevation-0"
      >
        <template #[`item.weight`]="{ item }">
          <span class="font-weight-bold">{{ formatWeight(item.weight) }} lbs</span>
        </template>
        <template #[`item.reps`]="{ item }">
          <v-chip size="small" color="blue-lighten-5" class="text-blue-darken-2">
            {{ item.reps }}
          </v-chip>
        </template>
        <template #[`item.rpe`]="{ item }">
          <v-chip
            size="small"
            :color="getRPEColor(item.rpe)"
          >
            {{ item.rpe }}
          </v-chip>
        </template>
        <template #[`item.pr`]="{ item }">
          <v-chip
            v-if="item.pr"
            size="small"
            color="amber-lighten-5"
            class="text-amber-darken-3"
          >
            <v-icon start size="small">mdi-trophy</v-icon>
            PR
          </v-chip>
          <v-chip
            v-else
            size="small"
            color="grey-lighten-3"
            variant="outlined"
          >
            --
          </v-chip>
        </template>
        <template #[`item.set_rank`]="{ item }">
          <span class="text-medium-emphasis">#{{ item.set_rank + 1 }}</span>
        </template>
        <template #[`item.date`]="{ item }">
          {{ formatTableDate(item.date) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.timeframe-selector {
  width: 100%;
}

.timeframe-selector .v-btn {
  flex: 1;
}

.chart-container {
  position: relative;
  height: 400px;
  padding: 16px;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1) !important;
}

.text-error {
  color: rgb(var(--v-theme-error));
}

.text-success {
  color: rgb(var(--v-theme-success));
}
</style>