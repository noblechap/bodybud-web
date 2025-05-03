<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center mb-6">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-primary">
        Body Composition Analytics
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
            <v-icon start>mdi-calendar-week</v-icon>
            Week
          </v-btn>
          <v-btn value="month" size="large">
            <v-icon start>mdi-calendar-month</v-icon>
            Month
          </v-btn>
          <v-btn value="year" size="large">
            <v-icon start>mdi-calendar-year</v-icon>
            Year
          </v-btn>
          <v-btn value="all" size="large">
            <v-icon start>mdi-calendar</v-icon>
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
            <v-icon color="primary" class="mr-3">mdi-scale</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Current Weight
              </div>
              <div class="text-h5 font-weight-bold">
                {{ formatWeight(latestWeight) }}
                <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">mdi-chart-line</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">30 Day Change</div>
              <div class="text-h5 font-weight-bold" :class="weightChangeClass">
                {{ weightChange30Days }} <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">mdi-percent</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">Body Fat %</div>
              <div class="text-h5 font-weight-bold">
                {{ latestBodyFat || "--" }}%
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4" rounded="lg">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3">mdi-trending-up</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">Weekly Avg</div>
              <div class="text-h5 font-weight-bold">
                {{ weeklyAverage }} <span class="text-body-2">lbs</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Interactive Chart -->
    <v-card class="mb-6 rounded-lg" elevation="2">
      <v-card-title class="pa-4 pb-2">
        <div class="text-h6">Weight Trend</div>
        <v-spacer></v-spacer>
        <v-chip
          v-if="bodyFatVisible"
          color="pink-lighten-5"
          variant="outlined"
          class="text-pink-darken-2"
          prepend-icon="mdi-eye-off"
          @click="toggleBodyFat"
        >
          Hide Body Fat
        </v-chip>
        <v-chip
          v-else
          color="indigo-lighten-5"
          variant="outlined"
          class="text-indigo-darken-2"
          prepend-icon="mdi-eye"
          @click="toggleBodyFat"
        >
          Show Body Fat
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <div ref="chartContainer" class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </v-card-text>
    </v-card>

    <!-- Data Table -->
    <v-card class="rounded-lg" elevation="2">
      <v-card-title class="pa-4">
        <div class="text-h6">Measurement History</div>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredBodyweights"
        :search="search"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.weight="{ item }">
          <span class="font-weight-bold"
            >{{ formatWeight(item.weight) }} lbs</span
          >
        </template>
        <template v-slot:item.body_fat_percentage="{ item }">
          <v-chip
            v-if="item.body_fat_percentage"
            size="small"
            :color="getBodyFatColor(item.body_fat_percentage)"
          >
            {{ item.body_fat_percentage }}%
          </v-chip>
          <span v-else>--</span>
        </template>
        <template v-slot:item.date="{ item }">
          {{ formatTableDate(item.date) }}
        </template>
        <template v-slot:item.notes="{ item }">
          <span v-if="item.notes" class="text-medium-emphasis">{{
            item.notes
          }}</span>
          <span v-else>--</span>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";
import { useClientStore } from "../../stores/clientStore";

const clientStore = useClientStore();

// Refs
const timeframe = ref("month");
const search = ref("");
const chartCanvas = ref(null);
const chartContainer = ref(null);
const bodyFatVisible = ref(true);
let chartInstance = null;

// Table headers
const headers = [
  { title: "Date", key: "date", width: "150px" },
  { title: "Weight", key: "weight", align: "end" },
  { title: "Body Fat %", key: "body_fat_percentage", align: "center" },
  { title: "Notes", key: "notes" },
];

// Weight formatting function
const formatWeight = (weightString) => {
  if (!weightString) return "--";
  const weight = parseFloat(weightString);
  return weight.toFixed(1);
};

// Computed properties
const filteredBodyweights = computed(() => {
  return [...clientStore.bodyweights].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
});

const latestWeight = computed(() => {
  return clientStore.bodyweights[0]?.weight || "--";
});

const latestBodyFat = computed(() => {
  return clientStore.bodyweights[0]?.body_fat_percentage;
});

const weightChange30Days = computed(() => {
  if (clientStore.bodyweights.length < 2) return "--";

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recent = parseFloat(clientStore.bodyweights[0]?.weight);
  const pastEntry = clientStore.bodyweights.find(
    (bw) => new Date(bw.date) <= thirtyDaysAgo,
  );
  const past = pastEntry ? parseFloat(pastEntry.weight) : null;

  if (!past) return "--";

  const change = (recent - past).toFixed(1);
  return change > 0 ? `+${change}` : change;
});

const weightChangeClass = computed(() => {
  if (weightChange30Days.value === "--") return "";
  return weightChange30Days.value.startsWith("+")
    ? "text-error"
    : "text-success";
});

const weeklyAverage = computed(() => {
  if (clientStore.bodyweights.length === 0) return "--";

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentWeights = clientStore.bodyweights
    .filter((bw) => new Date(bw.date) >= sevenDaysAgo)
    .map((bw) => parseFloat(bw.weight));

  if (recentWeights.length === 0) return "--";

  const sum = recentWeights.reduce((a, b) => a + b, 0);
  return (sum / recentWeights.length).toFixed(1);
});

// Methods
const formatTableDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getBodyFatColor = (percentage) => {
  const pct = parseFloat(percentage);
  if (pct < 12) return "green-lighten-2";
  if (pct < 18) return "blue-lighten-2";
  if (pct < 25) return "orange-lighten-2";
  return "red-lighten-2";
};

const toggleBodyFat = () => {
  bodyFatVisible.value = !bodyFatVisible.value;
  initChart();
};

// Chart functions
const initChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");

  // Filter data based on timeframe
  const now = new Date();
  let cutoffDate = new Date();

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
      cutoffDate = new Date(0); // Beginning of time
      break;
  }

  const filteredData = clientStore.bodyweights
    .filter((bw) => new Date(bw.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = filteredData.map((bw) =>
    new Date(bw.date).toLocaleDateString("en-US", {
      month: "short",
      day:
        timeframe.value === "year" || timeframe.value === "all"
          ? undefined
          : "numeric",
    }),
  );

  const weights = filteredData.map((bw) => parseFloat(bw.weight));
  const bodyFat = filteredData.map((bw) =>
    bw.body_fat_percentage ? parseFloat(bw.body_fat_percentage) : null,
  );

  // Create tooltip content
  const tooltipContent = filteredData.map((bw) => {
    let content = [`Weight: ${formatWeight(bw.weight)} lbs`];
    if (bw.body_fat_percentage)
      content.push(`Body Fat: ${bw.body_fat_percentage}%`);
    if (bw.notes) content.push(`Notes: ${bw.notes}`);
    return content.join("\n");
  });

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
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
          label: "Body Fat %",
          data: bodyFatVisible.value ? bodyFat : [],
          borderColor: "rgb(236, 72, 153)",
          backgroundColor: "rgba(236, 72, 153, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: "y1",
          hidden: !bodyFatVisible.value || bodyFat.every((v) => v === null),
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
            text: "Weight (lbs)",
          },
        },
        y1: {
          type: "linear",
          display: bodyFatVisible.value,
          position: "right",
          title: {
            display: true,
            text: "Body Fat %",
          },
          min: 0,
          max: 40,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });
};

// Lifecycle hooks
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

// Watchers
watch(
  () => clientStore.bodyweights,
  () => {
    initChart();
  },
  { deep: true },
);

watch(timeframe, () => {
  initChart();
});
</script>

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
