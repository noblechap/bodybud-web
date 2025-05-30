<template>
  <div class="client-profile-view">
    <div class="header-container">
      <h1 v-if="!isLoading">{{ clientStore.username }}'s Profile</h1>
      <h1 v-else>...</h1>
      <div>
        <v-menu offset-y offset-x location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="flat"
              color="grey-lighten-2"
              v-bind="props"
              size="small"
              class="mr-4"
            >
              <v-icon color="grey-darken-2">mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="showRemoveDialog = true">
              <v-list-item-title class="error--text">
                <v-icon color="error" left>mdi-close-box</v-icon>
                Remove Client
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn color="primary" @click="goBack">
          <v-icon start>mdi-arrow-left</v-icon>
          Back to Clients
        </v-btn>
      </div>
    </div>

    <v-card>
      <!-- Add your client management components here -->
      <v-tabs v-model="selectedTab">
        <v-tab>Check-In</v-tab>
        <v-tab>Nutrition</v-tab>
        <v-tab>Workout History</v-tab>
        <v-tab>Workout Templates</v-tab>
        <v-tab>Supplements</v-tab>
        <v-tab>Measurements</v-tab>
      </v-tabs>
    </v-card>

    <!-- CheckIn Tab -->
    <div v-if="selectedTab === 0" class="pa-6">
      <CheckinView v-if="!isLoading" />
    </div>

    <!-- Nutrition Tab -->
    <div v-else-if="selectedTab === 1" class="pa-6">
      <ClientMealPlanView v-if="!isLoading" />
    </div>

    <!-- Workout History -->
    <div v-else-if="selectedTab === 2" class="pa-6">
      <ClientWorkoutHistoryView v-if="!isLoading" />
    </div>

    <!-- Workout Templates -->
    <div v-else-if="selectedTab === 3" class="pa-6">
      <ClientWorkoutTemplatesView v-if="!isLoading" />
    </div>

    <!-- Supplement Tab -->
    <div v-else-if="selectedTab === 4" class="pa-6">
      <SupplementView v-if="!isLoading" />
    </div>

    <!-- BodyWeight Tab -->
    <div v-else-if="selectedTab === 5" class="pa-6">
      <BodyWeightView v-if="!isLoading" />
    </div>

    <!-- Optional fallback when there's no data -->
  </div>
  <v-dialog v-model="showRemoveDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Removal</v-card-title>
      <v-card-text>
        Are you sure you want to remove {{ clientStore.username }} as your
        client? This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="showRemoveDialog = false">
          Cancel
        </v-btn>
        <v-btn color="error" text @click="removeClient"> Remove </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import ClientWorkoutHistoryView from "./ClientWorkoutHistoryView.vue";
import ClientWorkoutTemplatesView from "./ClientWorkoutTemplatesView.vue";
import SupplementView from "./SupplementView.vue";
import BodyWeightView from "./BodyWeightView.vue";
import CheckinView from "./CheckinView.vue";
import ClientMealPlanView from "./ClientMealPlanView.vue";
import { useClientStore } from "../../stores/clientStore";
import { useCoachStore } from "../../stores/coachStore";

const clientStore = useClientStore();
const coachStore = useCoachStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const selectedTab = ref(0);
const { isLoading } = storeToRefs(clientStore);
const showRemoveDialog = ref(false);
const clientId = route.params.id;

onMounted(async () => {
  clientStore.fetchClient(clientId);
});

const goBack = () => {
  router.push({ name: "clients" });
};

const removeClient = async () => {
  try {
    //goBack();
    coachStore.removeClient(clientId);
    showRemoveDialog.value = false;
    await clientStore.removeClient();
    toast.success("Client removed successfully");
    router.push({ name: "clients" });
  } catch (error) {
    toast.error("Failed to remove client: " + error.message);
  }
};
</script>

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
</style>
