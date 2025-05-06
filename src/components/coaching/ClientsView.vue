<template>
  <div class="clients-view">
    <div class="header-container">
      <h1>Clients</h1>
      <v-btn color="primary" @click="showAddDialog = true">
        <v-icon start>mdi-plus</v-icon>
        New Client
      </v-btn>
    </div>

    <!-- Client Cards Grid -->
    <div class="client-grid">
      <div
        v-for="client in coachStore.clients"
        :key="client.id"
        class="client-card"
        @click="openClientProfile(client.id)"
      >
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

      <div v-if="coachStore.clients.length === 0" class="empty-state">
        No clients found
      </div>
    </div>

    <!-- Add Client Dialog (unchanged) -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>Add New Client</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="" ref="addClientForm">
            Username
            <v-text-field
              v-model="newClient.username"
              label=""
              :rules="usernameRules"
              required
              autocomplete="off"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addNewClient" :disabled="!isFormValid"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import { useCoachStore } from "../../stores/coachStore";

const router = useRouter();
const coachStore = useCoachStore();
const toast = useToast();

const showAddDialog = ref(false);
const newClient = ref({ username: "" });
const addClientForm = ref(null);

const isFormValid = computed(() => {
  return newClient.value.username.length >= 4;
});

const usernameRules = [
  (v) => !!v || "Username is required",
  (v) => (v && v.length >= 4) || "Username must be at least 4 characters",
];

const openClientProfile = (clientId) => {
  router.push({ name: "clientProfile", params: { id: clientId } });
};

const addNewClient = async () => {
  const { valid } = await addClientForm.value?.validate();
  if (!valid) return;
  try {
    coachStore.addClient(newClient.value);
    toast.success("Coaching invitation sent");
    showAddDialog.value = false;
    newClient.value.username = "";
  } catch (error) {
    if (error.response?.status === 404) {
      toast.error("Username not found");
    } else {
      toast.error(
        error.response?.data?.message || "Failed to send coaching invitation",
      );
    }
  }
};
</script>

<style scoped>
.clients-view {
  padding: 24px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.client-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 4px;
  max-width: 100%;
}

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

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
