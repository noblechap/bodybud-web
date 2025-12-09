<script setup lang="ts">
import { useAuthService } from "~/composables/services/useAuthService";
import { useCoachingService } from "~/composables/services/useCoachingService";

const { logout } = useAuthService();
const { loadInitialData } = useCoachingService();

onMounted(loadInitialData);
</script>

<template>
  <div class="fill-height">
    <GlobalLoading />
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>BodyBud Coaching</v-toolbar-title>
      <v-spacer />
      <v-btn icon title="Logout" @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
  </div>
</template>
