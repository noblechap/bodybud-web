<template>
  <v-app>
    <app-header v-if="!isCoachingRoute" />
    <v-main>
      <router-view />
    </v-main>
    <app-footer v-if="!isCoachingRoute" />
  </v-app>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

const route = useRoute();
const isCoachingRoute = computed(() => route.path.startsWith("/coaching"));
</script>
