<template>
  <div class="client-profile-view">
    <div class="header-container">
      <h1>Client Profile</h1>
      <v-btn color="primary" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        Back to Clients
      </v-btn>
    </div>

    <v-card>
      <!-- Add your client management components here -->
      <v-tabs v-model="selectedTab">
        <v-tab>Nutrition</v-tab>
        <v-tab>Workout History</v-tab>
        <v-tab>Workout Templates</v-tab>
        <v-tab>Supplements</v-tab>
        <v-tab>Measurements</v-tab>
      </v-tabs>
    </v-card>

    <!-- Nutrition Tab -->
    <div v-if="selectedTab === 0" class="pa-6">
      <ClientMealPlanView v-if="!isLoading" />
    </div>

    <!-- Workout History -->
    <div v-else-if="selectedTab === 1" class="pa-6">
      <ClientWorkoutHistoryView v-if="!isLoading" />
    </div>

    <!-- Workout Templates -->
    <div v-else-if="selectedTab === 2" class="pa-6">
      <ClientWorkoutTemplatesView v-if="!isLoading" />
    </div>

    <!-- Supplement Tab -->
    <div v-else-if="selectedTab === 3" class="pa-6">
      <SupplementView v-if="!isLoading" />
    </div>

    <!-- BodyWeight Tab -->
    <div v-else-if="selectedTab === 4" class="pa-6">
      <BodyWeightView v-if="!isLoading" />
    </div>

    <!-- Optional fallback when there's no data -->
  </div>
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
import ClientMealPlanView from "./ClientMealPlanView.vue";
import { useClientStore } from "../../stores/clientStore";

const clientStore = useClientStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const selectedTab = ref(0);
const { isLoading } = storeToRefs(clientStore);
const clientId = route.params.id;

onMounted(async () => {
  clientStore.fetchClient(clientId);
});

const goBack = () => {
  router.push({ name: "clients" });
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
