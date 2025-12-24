<script setup lang="ts">
import type { ClientInfo } from "~/types/models";
import CheckinView from "~/components/coaching/CheckinView.vue";
import { ClientProfileTab } from "~/composables/enums/clientProfileTab";
import { useClientService } from "~/composables/services/useClientService";

definePageMeta({
  middleware: "auth",
  layout: "coaching",
});

const route = useRoute();
const router = useRouter();
const clientService = useClientService();
const { createQueryParamComputed } = useUrl();

const clientId = computed(() => route.params.id as string);
const showRemoveDialog = ref(false);

const selectedTab = createQueryParamComputed(
  "tab",
  Object.values(ClientProfileTab),
  ClientProfileTab.CheckIn,
);

const clientInfo = ref<ClientInfo | null>(null);

// Watch for tab changes and clear all other query params
watch(selectedTab, (newTab) => {
  // Keep only the tab query param, remove all others
  router.replace({
    query: { tab: newTab },
  });
});

async function fetchClient() {
  try {
    clientInfo.value = await clientService.loadClientData(clientId.value);
  }
  catch {
    router.push("/coaching");
  }
}

function goBack() {
  router.push("/coaching");
}

async function removeClient() {
  showRemoveDialog.value = false;
  await clientService.deleteClient(clientId.value);
}

onMounted(() => {
  fetchClient();
});
</script>

<template>
  <div class="client-profile-view">
    <div class="header-container">
      <h1 v-if="clientInfo">
        {{ clientInfo.username }}'s Profile
      </h1>
      <div class="header-actions">
        <v-menu location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon="mdi-cog"
              variant="flat"
              color="grey-lighten-2"
              v-bind="props"
              size="small"
              class="mr-4"
            />
          </template>
          <v-list>
            <v-list-item @click="showRemoveDialog = true">
              <template #prepend>
                <v-icon color="error">
                  mdi-close-box
                </v-icon>
              </template>
              <v-list-item-title class="text-error">
                Remove Client
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn color="primary" @click="goBack">
          <v-icon start>
            mdi-arrow-left
          </v-icon>
          Back to Clients
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-tabs v-model="selectedTab" grow color="primary">
        <v-tab :value="ClientProfileTab.CheckIn">
          Check-In
        </v-tab>
        <v-tab :value="ClientProfileTab.Nutrition">
          Nutrition
        </v-tab>
        <v-tab :value="ClientProfileTab.WorkoutHistory">
          Workout History
        </v-tab>
        <v-tab :value="ClientProfileTab.WorkoutTemplates">
          Workout Templates
        </v-tab>
        <v-tab :value="ClientProfileTab.Supplements">
          Supplements
        </v-tab>
        <v-tab :value="ClientProfileTab.Measurements">
          Measurements
        </v-tab>
        <v-tab :value="ClientProfileTab.Steps">
          Steps
        </v-tab>
        <v-tab :value="ClientProfileTab.ExerciseProgression">
          Exercise Progression
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Tab Content -->
    <v-tabs-window v-model="selectedTab" class="tab-content">
      <!-- Check-In Tab -->
      <v-tabs-window-item :value="ClientProfileTab.CheckIn">
        <div class="pa-6">
          <CheckinView
            v-if="clientInfo"
            :checkins="clientInfo.client_checkins"
            :client-id="Number(clientId)"
          />
        </div>
      </v-tabs-window-item>

      <!-- Nutrition Tab -->
      <v-tabs-window-item :value="ClientProfileTab.Nutrition">
        <ClientMealPlanView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Workout History Tab -->
      <v-tabs-window-item :value="ClientProfileTab.WorkoutHistory">
        <ClientWorkoutHistoryView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Workout Templates Tab -->
      <v-tabs-window-item :value="ClientProfileTab.WorkoutTemplates">
        <ClientWorkoutTemplatesView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Supplements Tab -->
      <v-tabs-window-item :value="ClientProfileTab.Supplements">
        <SupplementView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Measurements Tab -->
      <v-tabs-window-item :value="ClientProfileTab.Measurements">
        <BodyWeightView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Steps Tab -->
      <v-tabs-window-item :value="ClientProfileTab.Steps">
        <StepsView v-if="clientInfo" />
      </v-tabs-window-item>

      <!-- Exercise Progression Tab -->
      <v-tabs-window-item :value="ClientProfileTab.ExerciseProgression">
        <ClientExerciseProgressionWrapper v-if="clientInfo" />
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Remove Client Dialog -->
    <v-dialog v-model="showRemoveDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">
          Confirm Removal
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove {{ clientInfo?.username }} as your
          client? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showRemoveDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="removeClient">
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.client-profile-view {
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-content {
  margin-top: 0;
}
</style>
