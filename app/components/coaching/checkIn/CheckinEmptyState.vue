<script setup lang="ts">
interface Props {
  tab: "all" | "completed" | "pending" | "overdue";
}

defineProps<Props>();

const emit = defineEmits<{
  assignCheckin: [];
}>();

function handleAssignClick() {
  emit("assignCheckin");
}

function getEmptyStateMessage(tab: string): string {
  switch (tab) {
    case "completed":
      return "No completed check-ins found.";
    case "pending":
      return "No pending check-ins found.";
    case "overdue":
      return "No overdue check-ins found.";
    default:
      return "This client has no check-ins yet.";
  }
}
</script>

<template>
  <div class="empty-state">
    <v-icon size="80" color="grey-lighten-2">
      mdi-text-box-search-outline
    </v-icon>
    <h3 class="text-h6 mt-4">
      No check-ins found
    </h3>
    <p class="text-body-2 text-medium-emphasis">
      {{ getEmptyStateMessage(tab) }}
    </p>
    <v-btn
      color="primary"
      class="mt-4"
      prepend-icon="mdi-plus"
      @click="handleAssignClick"
    >
      Assign New Check-In
    </v-btn>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
