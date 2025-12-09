<script setup lang="ts">
import type { Client } from "~/types/models";

interface Props {
  client: Client;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [clientId: number];
}>();

function handleClick() {
  emit("click", props.client.id);
}
</script>

<template>
  <div class="client-card" @click="handleClick">
    <v-avatar size="48" class="client-avatar">
      <v-img
        v-if="client.profile_picture"
        :src="client.profile_picture"
        alt="Profile picture"
      />
      <v-icon v-else size="48" color="grey-lighten-1">
        mdi-account-circle
      </v-icon>
    </v-avatar>
    <span class="client-name">{{ client.username }}</span>
  </div>
</template>

<style scoped>
.client-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.client-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.client-avatar {
  flex-shrink: 0;
  border: 2px solid #f5f5f5;
}

.client-name {
  font-weight: 600;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
