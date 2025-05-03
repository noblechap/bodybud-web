<template>
  <v-container fluid class="pa-4 pa-md-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-primary">
        Supplement Protocol
      </h2>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        size="large"
        @click="openAddDialog"
      >
        Add Supplement
      </v-btn>
    </div>

    <!-- Supplements Grid -->
    <template v-if="clientStore.supplements.length > 0">
      <v-row class="g-4">
        <v-col
          v-for="supplement in sortedSupplements"
          :key="supplement.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="pa-0 supplement-card"
            elevation="4"
            rounded="xl"
            @click="openEditDialog(supplement)"
          >
            <!-- Header Section with primary background -->
            <v-card-title
              class="d-flex justify-space-between align-center bg-primary pa-4 pa-md-6"
            >
              <div>
                <h3 class="text-h6 font-weight-bold mb-1 text-white">
                  {{ supplement.name }}
                </h3>
                <p class="text-caption text-white text-lighten-2">
                  {{ formatDate(supplement.date) }}
                </p>
              </div>
              <v-icon icon="mdi-pill" size="28" color="white" />
            </v-card-title>

            <!-- Content Section -->
            <v-card-text class="pa-0">
              <div class="pa-4 pa-md-6">
                <div>
                  <div class="mb-3">
                    <h4
                      class="text-subtitle-1 font-weight-medium mb-1 text-grey-darken-3"
                    >
                      Dosage
                    </h4>
                    <p class="text-body-2 text-grey-darken-2">
                      {{ supplement.dose }}
                    </p>
                  </div>

                  <div v-if="supplement.notes">
                    <h4
                      class="text-subtitle-1 font-weight-medium mb-1 text-grey-darken-3"
                    >
                      Notes
                    </h4>
                    <p class="text-body-2 text-grey-darken-2">
                      {{ supplement.notes }}
                    </p>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-card
      v-if="clientStore.supplements.length === 0"
      flat
      color="surface-variant"
      class="rounded-lg pa-8 text-center"
    >
      <v-icon size="64" color="primary" class="mb-4">mdi-pill</v-icon>
      <h3 class="text-h6 mb-2">No Supplements Found</h3>
      <p class="text-medium-emphasis mb-4">Add a supplement to get started.</p>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-plus"
        size="large"
        @click="openAddDialog"
      >
        Add Supplement
      </v-btn>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="500">
      <v-card class="pa-4" elevation="8">
        <v-card-title class="text-h6 font-weight-bold">
          {{ isEditing ? "Edit Supplement" : "Add New Supplement" }}
        </v-card-title>

        <v-card-text class="pt-2">
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="currentSupplement.name"
              label="Supplement Name"
              :rules="[(v) => !!v || 'Name is required']"
              required
              prepend-inner-icon="mdi-pill"
            />
            <v-text-field
              v-model="currentSupplement.dose"
              label="Dosage (e.g., 5g, 2 capsules)"
              :rules="[(v) => !!v || 'Dosage is required']"
              required
              prepend-inner-icon="mdi-scale-balance"
            />
            <v-textarea
              v-model="currentSupplement.notes"
              label="Notes (optional)"
              auto-grow
              prepend-inner-icon="mdi-note-text"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-space-between">
          <v-btn
            v-if="isEditing"
            variant="text"
            color="error"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
          <div class="d-flex justify-end flex-grow-1">
            <v-btn variant="text" color="grey" @click="closeDialog">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="saveSupplement"
              :disabled="!formValid"
            >
              {{ isEditing ? "Update" : "Save" }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this supplement?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" @click="deleteSupplement">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, ref } from "vue";
import { useClientStore } from "../../stores/clientStore";
import { useToast } from "vue-toastification";

const clientStore = useClientStore();
const toast = useToast();

// Dialog state
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const formValid = ref(false);

// Current supplement being edited/added
const currentSupplement = ref({
  id: null,
  name: "",
  dose: "",
  notes: "",
  date: "",
});

const sortedSupplements = computed(() =>
  [...clientStore.supplements].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  ),
);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const openAddDialog = () => {
  isEditing.value = false;
  currentSupplement.value = {
    id: null,
    name: "",
    dose: "",
    notes: "",
  };
  showDialog.value = true;
};

const openEditDialog = (supplement) => {
  isEditing.value = true;
  currentSupplement.value = {
    id: supplement.id,
    name: supplement.name,
    dose: supplement.dose,
    notes: supplement.notes,
  };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const saveSupplement = () => {
  if (!formValid.value) return;

  try {
    if (isEditing.value) {
      clientStore.updateSupplement(currentSupplement.value);
      toast.success("Supplement updated successfully!");
    } else {
      clientStore.addSupplement(currentSupplement.value);
      toast.success("Supplement added successfully!");
    }
    showDialog.value = false;
  } catch (error) {
    toast.error(`Failed to ${isEditing.value ? "update" : "add"} supplement.`);
  }
};

const confirmDelete = () => {
  showDeleteDialog.value = true;
};

const deleteSupplement = () => {
  try {
    clientStore.deleteSupplement(currentSupplement.value.id);
    toast.success("Supplement deleted successfully!");
    showDeleteDialog.value = false;
    showDialog.value = false;
  } catch (error) {
    toast.error("Failed to delete supplement.");
  }
};
</script>

<style scoped>
.supplement-card {
  overflow: hidden;
  cursor: pointer;
}

.supplement-card .v-card-title {
  border-radius: 12px 12px 0 0 !important;
}

.v-card {
  transition: transform 0.2s ease;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
