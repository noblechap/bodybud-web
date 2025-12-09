<script setup lang="ts">
import type { ApiErrorResponse } from "~/types/errors";
import { useCoachingService } from "~/composables/services/useCoachingService";
import { useCoachingStore } from "~/store/coachingStore";

const coachingStore = useCoachingStore();
const { isAddingClient } = storeToRefs(coachingStore);
const coachingService = useCoachingService();

const showDialog = defineModel<boolean>({ default: false });

const newClientUsername = ref("");
const form = ref<HTMLFormElement | null>(null);

const isFormValid = computed(() => {
  return newClientUsername.value.length >= 4;
});

const usernameRules = [
  (v: string) => !!v || "Username is required",
  (v: string) => (v && v.length >= 4) || "Username must be at least 4 characters",
];

async function handleAddClient() {
  if (!isFormValid.value) {
    return;
  }

  try {
    await coachingService.addClient({ username: newClientUsername.value });
    showDialog.value = false;
    newClientUsername.value = "";
    useToast().success("Coaching invitation sent");
  }
  catch (error: unknown) {
    const errorObj = error as ApiErrorResponse;
    if (errorObj.response?.status === 404) {
      useToast().error("Username not found");
    }
    else {
      useToast().error(
        errorObj.response?.data?.message || "Failed to send coaching invitation",
      );
    }
  }
}

function handleCancel() {
  showDialog.value = false;
  newClientUsername.value = "";
}
</script>

<template>
  <v-dialog v-model="showDialog" max-width="500">
    <v-card>
      <v-card-title>Add New Client</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleAddClient">
          <div class="mb-2">
            Username
          </div>
          <v-text-field
            v-model="newClientUsername"
            label=""
            :rules="usernameRules"
            required
            autocomplete="off"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" @click="handleCancel">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!isFormValid"
          :loading="isAddingClient"
          @click="handleAddClient"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
