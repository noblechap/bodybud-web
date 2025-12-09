<script setup lang="ts">
import type { CheckIn } from "~/types/checkIn";

interface Props {
  checkins: CheckIn[];
}

defineProps<Props>();

const emit = defineEmits<{
  view: [checkin: CheckIn];
}>();

function handleView(checkin: CheckIn) {
  emit("view", checkin);
}
</script>

<template>
  <CheckinGrid
    :checkins="checkins"
    @view="handleView"
  />
</template>
