<template>
  <div v-if="authStore.isAuthenticated" class="fill-height">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>BodyBud Coaching</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout" title="Logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <router-view></router-view>
  </div>
  <LoginView v-else />
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useCoachStore } from "../stores/coachStore";
import LoginView from "../components/LoginView.vue";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const coachStore = useCoachStore();
const router = useRouter();

const logout = async () => {
  try {
    authStore.logout();
    router.push("/coaching");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(async () => {
  try {
    coachStore.fetchClients();
    coachStore.fetchMeals();
  } catch (error) {
    console.error("Error fetching clients:", error);
  }
});
</script>
