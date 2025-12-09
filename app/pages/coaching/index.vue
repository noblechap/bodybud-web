<script setup lang="ts">
import type { Client } from "~/types/models";
import { formatTimeAgo } from "@vueuse/core";
import { differenceInDays, format, parseISO } from "date-fns";
import { useCoachingService } from "~/composables/services/useCoachingService";
import { useCoachingStore } from "~/store/coachingStore";

definePageMeta({
  middleware: "auth",
  layout: "coaching"
});

const coachingService = useCoachingService();

const { clients } = storeToRefs(useCoachingStore());

const clientProfileTab = ref("overview");
const selectedClient = ref<Client>();
const search = ref("");
const isEditing = ref(false);
const showAddClientDialog = ref(false);
const newClientEmail = ref("");
const editForm = ref({
  client_full_name: "",
  client_email: "",
  client_phone: "",
  client_emergency_contact: "",
  client_notes: "",
});

const stats = computed(() => {
  const total = clients.value.length;
  const active = clients.value.filter((c) => c.client_full_name && c.client_full_name.trim() !== "").length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentClients = clients.value.filter((c) => {
    if (!c.coaching_since) {
      return false;
    }
    return parseISO(c.coaching_since) >= weekAgo;
  }).length;

  return { total, active, recentClients };
});

const filteredClients = computed(() => {
  let result = clients.value;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (c) =>
        c.username.toLowerCase().includes(searchLower)
        || (c.client_full_name && c.client_full_name.toLowerCase().includes(searchLower))
        || (c.client_email && c.client_email.toLowerCase().includes(searchLower)),
    );
  }

  return result;
});

function selectClient(client: Client) {
  selectedClient.value = client;
  isEditing.value = false;
  editForm.value = {
    client_full_name: client.client_full_name || "",
    client_email: client.client_email || "",
    client_phone: client.client_phone || "",
    client_emergency_contact: client.client_emergency_contact || "",
    client_notes: client.client_notes || "",
  };
}

function closeDetails() {
  selectedClient.value = undefined;
  isEditing.value = false;
}

function startEditing() {
  if (!selectedClient.value) {
    return;
  }
  isEditing.value = true;
  editForm.value = {
    client_full_name: selectedClient.value.client_full_name || "",
    client_email: selectedClient.value.client_email || "",
    client_phone: selectedClient.value.client_phone || "",
    client_emergency_contact: selectedClient.value.client_emergency_contact || "",
    client_notes: selectedClient.value.client_notes || "",
  };
}

function cancelEditing() {
  isEditing.value = false;
  if (selectedClient.value) {
    editForm.value = {
      client_full_name: selectedClient.value.client_full_name || "",
      client_email: selectedClient.value.client_email || "",
      client_phone: selectedClient.value.client_phone || "",
      client_emergency_contact: selectedClient.value.client_emergency_contact || "",
      client_notes: selectedClient.value.client_notes || "",
    };
  }
}

async function saveClient() {
  if (!selectedClient.value) {
    return;
  }

  try {
    await coachingService.updateClient(selectedClient.value.id, editForm.value);

    // Recharger la liste complète des clients
    await coachingService.fetchClients();

    // Mettre à jour le client sélectionné avec les nouvelles données du store
    if (selectedClient.value) {
      const updatedClient = clients.value.find((c) => c.id === selectedClient.value?.id);
      if (updatedClient) {
        selectedClient.value = updatedClient;
      }
    }

    // Fermer le mode édition
    isEditing.value = false;
  }
  catch (error) {
    console.error("Failed to save client:", error);
  }
}

function openAddClientDialog() {
  newClientEmail.value = "";
  showAddClientDialog.value = true;
}

function closeAddClientDialog() {
  showAddClientDialog.value = false;
  newClientEmail.value = "";
}

async function addClient() {
  if (!newClientEmail.value || !newClientEmail.value.trim()) {
    return;
  }

  try {
    await coachingService.addClient({ username: newClientEmail.value.trim() });
    await coachingService.fetchClients();
    closeAddClientDialog();
  }
  catch (error) {
    console.error("Failed to add client:", error);
  }
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return "Never";
  }

  const date = parseISO(dateString);
  const now = new Date();
  const diffDays = differenceInDays(now, date);

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1 || diffDays < 7) {
    return formatTimeAgo(date);
  }

  return format(date, "dd MMM yyyy");
}

function getInitials(client: Client): string {
  if (client.client_full_name) {
    const parts = client.client_full_name.trim().split(" ").filter((p) => p.length > 0);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (parts.length >= 2 && first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    return client.client_full_name.substring(0, 2).toUpperCase();
  }
  return client.username.substring(0, 2).toUpperCase();
}

async function loadClients() {
  try {
    await coachingService.fetchClients();
  }
  catch {
    // L'erreur est déjà gérée par le service
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === "Escape") {
    if (isEditing.value) {
      cancelEditing();
    }
    else if (selectedClient.value) {
      closeDetails();
    }
  }
}

onMounted(() => {
  loadClients();

  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <!-- Panneau principal -->
      <v-col
        :cols="12"
        :md="selectedClient ? 8 : 12"
        :class="{ 'd-none d-md-block': selectedClient }"
      >
        <div class="pa-4 pa-md-6">
          <!-- En-tête avec titre et actions -->
          <v-row class="mb-6 align-center">
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon size="40" color="primary" class="mr-4">
                  mdi-chart-box-outline
                </v-icon>
                <div>
                  <h1 class="text-h4 font-weight-bold mb-1">
                    Coaching Dashboard
                  </h1>
                  <p class="text-body-2 text-medium-emphasis">
                    Manage your clients and track their progress
                  </p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="text-md-right">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                size="large"
                @click="openAddClientDialog"
              >
                Add Client
              </v-btn>
            </v-col>
          </v-row>

          <!-- Statistics Cards Grid -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" lg="3">
              <v-card
                elevation="2"
                class="gradient-card gradient-primary"
                rounded="lg"
              >
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-white mb-1 text-uppercase font-weight-medium">
                        Total Clients
                      </p>
                      <p class="text-h3 font-weight-bold text-white">
                        {{ stats.total }}
                      </p>
                    </div>
                    <v-avatar size="64" color="white" class="elevation-4">
                      <v-icon size="32" color="primary">
                        mdi-account-group
                      </v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
              <v-card
                elevation="2"
                class="gradient-card gradient-success"
                rounded="lg"
              >
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-white mb-1 text-uppercase font-weight-medium">
                        With Contact Info
                      </p>
                      <p class="text-h3 font-weight-bold text-white">
                        {{ stats.active }}
                      </p>
                    </div>
                    <v-avatar size="64" color="white" class="elevation-4">
                      <v-icon size="32" color="success">
                        mdi-check-circle
                      </v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
              <v-card
                elevation="2"
                class="gradient-card gradient-warning"
                rounded="lg"
              >
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-white mb-1 text-uppercase font-weight-medium">
                        New This Week
                      </p>
                      <p class="text-h3 font-weight-bold text-white">
                        {{ stats.recentClients }}
                      </p>
                    </div>
                    <v-avatar size="64" color="white" class="elevation-4">
                      <v-icon size="32" color="warning">
                        mdi-calendar-week
                      </v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search clients by username, name, or email"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                rounded
              />
            </v-col>
          </v-row>

          <!-- Clients Grid -->
          <v-row>
            <v-col
              v-for="client in filteredClients"
              :key="client.id"
              cols="12"
              sm="6"
              :md="selectedClient ? 6 : 4"
              :lg="selectedClient ? 6 : 3"
            >
              <v-card
                elevation="2"
                rounded="lg"
                hover
                class="athlete-card"
                @click="selectClient(client)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-4">
                    <v-avatar color="primary" size="56" class="mr-3">
                      <v-img
                        v-if="client.profile_picture"
                        :src="client.profile_picture"
                        :alt="client.client_full_name || client.username"
                        cover
                      >
                        <template #error>
                          <span class="text-h6 font-weight-bold text-white">
                            {{ getInitials(client) }}
                          </span>
                        </template>
                      </v-img>
                      <span v-else class="text-h6 font-weight-bold text-white">
                        {{ getInitials(client) }}
                      </span>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-1 font-weight-bold mb-1">
                        {{ client.client_full_name || client.username }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        @{{ client.username }}
                      </div>
                    </div>
                    <v-chip
                      v-if="client.client_phone || client.client_email"
                      color="success"
                      size="small"
                      variant="flat"
                    >
                      <v-icon start size="small">
                        mdi-check-circle
                      </v-icon>
                      Contact Info
                    </v-chip>
                  </div>

                  <v-divider class="mb-3" />

                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-calendar-check</v-icon>
                      Coaching since
                    </span>
                    <span class="text-caption font-weight-medium">
                      {{ formatDate(client.coaching_since) }}
                    </span>
                  </div>

                  <div v-if="client.client_email" class="d-flex align-center mt-2">
                    <v-icon size="small" class="mr-2" color="primary">
                      mdi-email
                    </v-icon>
                    <span class="text-caption text-truncate">
                      {{ client.client_email }}
                    </span>
                  </div>

                  <div v-if="client.client_phone" class="d-flex align-center mt-2">
                    <v-icon size="small" class="mr-2" color="primary">
                      mdi-phone
                    </v-icon>
                    <span class="text-caption">
                      {{ client.client_phone }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Empty State -->
            <v-col v-if="filteredClients.length === 0" cols="12">
              <v-card elevation="0" class="text-center pa-12" rounded="lg">
                <v-icon size="96" color="grey-lighten-1" class="mb-4">
                  mdi-account-search-outline
                </v-icon>
                <div class="text-h6 mb-2">
                  No Clients Found
                </div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Try adjusting your search
                </div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="search = ''"
                >
                  Clear Search
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>

      <!-- Panneau de détails latéral -->
      <v-col
        v-if="selectedClient"
        cols="12"
        md="4"
        class="detail-panel"
      >
        <v-card
          elevation="8"
          class="detail-card"
          rounded="0"
          height="100vh"
        >
          <v-card-title class="pa-4 pa-md-6 bg-blue-grey-lighten-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center flex-grow-1">
                <v-avatar color="primary" size="48" class="mr-3">
                  <v-img
                    v-if="selectedClient.profile_picture"
                    :src="selectedClient.profile_picture"
                    :alt="selectedClient.client_full_name || selectedClient.username"
                    cover
                  >
                    <template #error>
                      <span class="text-h6 font-weight-bold">
                        {{ getInitials(selectedClient) }}
                      </span>
                    </template>
                  </v-img>
                  <span v-else class="text-h6 font-weight-bold">
                    {{ getInitials(selectedClient) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 text-md-h6 font-weight-bold">
                    {{ selectedClient.client_full_name || selectedClient.username }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Client Profile
                  </div>
                </div>
              </div>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="closeDetails"
              />
            </div>
          </v-card-title>

          <v-tabs
            v-model="clientProfileTab"
            bg-color="transparent"
            color="primary"
            grow
          >
            <v-tab value="overview">
              <v-icon start>
                mdi-account
              </v-icon>
              Overview
            </v-tab>
            <v-tab value="notes">
              <v-icon start>
                mdi-note-text
              </v-icon>
              Notes
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-card-text class="pa-4 pa-md-6 detail-content">
            <v-tabs-window v-model="clientProfileTab">
              <!-- Onglet Overview -->
              <v-tabs-window-item value="overview">
                <!-- Mode lecture -->
                <div v-if="!isEditing">
                  <div class="d-flex justify-end mb-4">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-pencil"
                      @click="startEditing"
                    >
                      Edit Information
                    </v-btn>
                  </div>

                  <div class="mb-6">
                    <h3 class="text-h6 font-weight-bold mb-4">
                      <v-icon color="primary" class="mr-2">
                        mdi-information
                      </v-icon>
                      Contact Information
                    </h3>
                    <v-list density="compact" class="bg-transparent">
                      <v-list-item>
                        <template #prepend>
                          <v-icon color="primary">
                            mdi-account
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Username:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ selectedClient.username }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="selectedClient.client_full_name">
                        <template #prepend>
                          <v-icon color="primary">
                            mdi-account-card-details
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Full Name:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ selectedClient.client_full_name }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="selectedClient.client_email">
                        <template #prepend>
                          <v-icon color="primary">
                            mdi-email
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Email:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ selectedClient.client_email }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="selectedClient.client_phone">
                        <template #prepend>
                          <v-icon color="primary">
                            mdi-phone
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Phone:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ selectedClient.client_phone }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="selectedClient.client_emergency_contact">
                        <template #prepend>
                          <v-icon color="error">
                            mdi-card-account-phone
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Emergency Contact:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ selectedClient.client_emergency_contact }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>

                  <v-divider class="my-6" />

                  <div>
                    <h3 class="text-h6 font-weight-bold mb-4">
                      <v-icon color="success" class="mr-2">
                        mdi-calendar-account
                      </v-icon>
                      Coaching Information
                    </h3>
                    <v-list density="compact" class="bg-transparent">
                      <v-list-item>
                        <template #prepend>
                          <v-icon color="success">
                            mdi-calendar-check
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">
                          <strong>Coaching Since:</strong>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ formatDate(selectedClient.coaching_since) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </div>

                <!-- Mode édition -->
                <div v-else>
                  <div class="d-flex justify-end gap-2 mb-4">
                    <v-btn
                      color="grey"
                      variant="outlined"
                      prepend-icon="mdi-close"
                      @click="cancelEditing"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-content-save"
                      @click="saveClient"
                    >
                      Save Changes
                    </v-btn>
                  </div>

                  <h3 class="text-h6 font-weight-bold mb-4">
                    <v-icon color="primary" class="mr-2">
                      mdi-pencil
                    </v-icon>
                    Edit Client Information
                  </h3>

                  <v-form>
                    <v-text-field
                      v-model="editForm.client_full_name"
                      label="Full Name"
                      prepend-inner-icon="mdi-account-circle"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="editForm.client_email"
                      label="Email"
                      type="email"
                      prepend-inner-icon="mdi-email"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="editForm.client_phone"
                      label="Phone"
                      type="tel"
                      prepend-inner-icon="mdi-phone"
                      variant="outlined"
                      density="comfortable"
                      placeholder="(123) 456-7890"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="editForm.client_emergency_contact"
                      label="Emergency Contact"
                      prepend-inner-icon="mdi-card-account-phone"
                      variant="outlined"
                      density="comfortable"
                      placeholder="John Doe - (123) 456-7890"
                      hint="Name and phone number"
                      class="mb-3"
                    />
                  </v-form>
                </div>
              </v-tabs-window-item>

              <!-- Onglet Notes -->
              <v-tabs-window-item value="notes">
                <!-- Mode lecture -->
                <div v-if="!isEditing">
                  <div class="d-flex justify-end mb-4">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-pencil"
                      @click="startEditing"
                    >
                      Edit Notes
                    </v-btn>
                  </div>

                  <div v-if="selectedClient.client_notes" class="mb-6">
                    <h3 class="text-h6 font-weight-bold mb-4">
                      <v-icon color="primary" class="mr-2">
                        mdi-note-text
                      </v-icon>
                      Client Notes
                    </h3>
                    <div class="text-body-2" style="white-space: pre-wrap;">
                      {{ selectedClient.client_notes }}
                    </div>
                  </div>
                </div>

                <!-- Mode édition -->
                <div v-else>
                  <div class="d-flex justify-end gap-2 mb-4">
                    <v-btn
                      color="grey"
                      variant="outlined"
                      prepend-icon="mdi-close"
                      @click="cancelEditing"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-content-save"
                      @click="saveClient"
                    >
                      Save Changes
                    </v-btn>
                  </div>

                  <h3 class="text-h6 font-weight-bold mb-4">
                    <v-icon color="primary" class="mr-2">
                      mdi-pencil
                    </v-icon>
                    Edit Client Notes
                  </h3>

                  <v-textarea
                    v-model="editForm.client_notes"
                    label="Notes"
                    prepend-inner-icon="mdi-note-text"
                    variant="outlined"
                    rows="10"
                    placeholder="Add notes about this client, their goals, progress, or any important information..."
                    persistent-placeholder
                  />
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4 pa-md-6">
            <v-btn
              :to="`/coaching/client/${selectedClient.id}`"
              color="primary"
              variant="elevated"
              block
              size="large"
              prepend-icon="mdi-account-details"
            >
              View Full Profile
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Dialog pour ajouter un client -->
  <v-dialog v-model="showAddClientDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon color="primary" class="mr-2">
          mdi-account-plus
        </v-icon>
        Add New Client
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Enter the username of the user you want to add as a client. They will receive a coaching invitation.
        </p>

        <v-text-field
          v-model="newClientEmail"
          label="Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          placeholder="username"
          :rules="[
            v => !!v || 'Username is required',
            v => (v && v.length >= 4) || 'Username must be at least 4 characters',
          ]"
          autofocus
          @keyup.enter="addClient"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="closeAddClientDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :disabled="!newClientEmail || newClientEmail.trim().length < 4"
          @click="addClient"
        >
          Add Client
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gradient-card {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.gradient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.gradient-primary {
  --gradient-start: rgb(var(--v-theme-primary));
  --gradient-end: rgb(var(--v-theme-primary-darken-1));
}

.gradient-success {
  --gradient-start: rgb(var(--v-theme-success));
  --gradient-end: #2e7d32;
}

.gradient-warning {
  --gradient-start: rgb(var(--v-theme-warning));
  --gradient-end: #ef6c00;
}

.gradient-error {
  --gradient-start: rgb(var(--v-theme-error));
  --gradient-end: #c62828;
}

.gradient-secondary {
  --gradient-start: rgb(var(--v-theme-secondary));
  --gradient-end: rgb(var(--v-theme-secondary-darken-1));
}

.gradient-info {
  --gradient-start: rgb(var(--v-theme-info));
  --gradient-end: #0277bd;
}

.athlete-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.athlete-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.detail-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  overflow: hidden;
  z-index: 1000;
}

@media (min-width: 960px) {
  .detail-panel {
    position: sticky;
    z-index: auto;
  }
}

.detail-card {
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.detail-content {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

@media (min-width: 960px) {
  .detail-content {
    max-height: calc(100vh - 180px);
  }
}

/* Animations d'entrée */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.v-card {
  animation: fadeInUp 0.3s ease-out;
}

.detail-panel .detail-card {
  animation: slideInRight 0.3s ease-out;
}
</style>
