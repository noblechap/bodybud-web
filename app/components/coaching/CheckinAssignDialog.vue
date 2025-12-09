<script setup lang="ts">
import type { CheckInTemplate } from "~/types/models";
import { useCoachingService } from "~/composables/services/useCoachingService";
import { useCoachingStore } from "~/store/coachingStore";

const emit = defineEmits<{
  assignScratch: [];
  assignTemplate: [template: CheckInTemplate];
}>();

const isOpen = defineModel<boolean>({ required: true });

const { error, success } = useToast();
const coachingService = useCoachingService();
const { checkInTemplates: templates } = storeToRefs(useCoachingStore());

const showTemplateSelection = ref(false);
const selectedTemplateId = ref<number | null>(null);
const showDeleteConfirm = ref(false);
const templateToDelete = ref<CheckInTemplate | null>(null);

const selectedTemplate = computed(() => {
  return templates.value.find((t) => t.id === selectedTemplateId.value);
});

function closeDialog() {
  isOpen.value = false;
  // Reset state when closing
  showTemplateSelection.value = false;
  selectedTemplateId.value = null;
}

function selectTemplate(template: CheckInTemplate) {
  if (selectedTemplateId.value === template.id) {
    selectedTemplateId.value = null;
    return;
  }
  selectedTemplateId.value = template.id;
}

function assignFromScratch() {
  emit("assignScratch");
  closeDialog();
}

function assignFromTemplate() {
  if (selectedTemplate.value) {
    emit("assignTemplate", selectedTemplate.value);
    closeDialog();
  }
}

function promptDelete(template: CheckInTemplate) {
  templateToDelete.value = template;
  showDeleteConfirm.value = true;
}

async function deleteTemplate() {
  if (!templateToDelete.value)
    return;

  try {
    await coachingService.deleteCheckInTemplate(templateToDelete.value.id);
    success("Template deleted successfully");
    selectedTemplateId.value = null;
  }
  catch {
    error("Failed to delete template");
  }
  finally {
    showDeleteConfirm.value = false;
    templateToDelete.value = null;
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="800"
    scrollable
    @update:model-value="closeDialog"
  >
    <v-card>
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title>Assign New Check-In</v-toolbar-title>
        <v-btn icon="mdi-close" @click="closeDialog" />
      </v-toolbar>

      <v-card-text class="pa-6">
        <div class="assign-options">
          <v-card
            class="option-card scratch-card"
            variant="outlined"
            @click="assignFromScratch"
          >
            <div class="option-icon">
              <v-icon size="48" color="primary">
                mdi-file-document-edit-outline
              </v-icon>
            </div>
            <v-card-title class="text-h6">
              Create From Scratch
            </v-card-title>
            <v-card-text class="text-medium-emphasis">
              Build a custom check-in form with your own questions and
              requirements
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="text" block>
                Select
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card
            class="option-card template-card"
            variant="outlined"
            @click="showTemplateSelection = true"
          >
            <div class="option-icon">
              <v-icon size="48" color="purple">
                mdi-clipboard-text-outline
              </v-icon>
            </div>
            <v-card-title class="text-h6">
              Use Template
            </v-card-title>
            <v-card-text class="text-medium-emphasis">
              Select from your existing templates to quickly assign a check-in
            </v-card-text>
            <v-card-actions>
              <v-btn color="purple" variant="text" block>
                Select
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <!-- Template Selection -->
        <div
          v-if="showTemplateSelection"
          class="template-selection-container"
        >
          <h3 class="text-h6 mb-4">
            Select a Template
          </h3>

          <div
            v-if="templates.length === 0"
            class="empty-templates"
          >
            <v-icon size="64" color="grey-lighten-2">
              mdi-clipboard-remove-outline
            </v-icon>
            <p class="text-body-1 text-medium-emphasis mt-4">
              No templates available.
            </p>
          </div>

          <div v-else class="template-list-container">
            <div class="template-list">
              <v-card
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                :class="{
                  'selected-template': selectedTemplateId === template.id,
                }"
                variant="outlined"
                @click="selectTemplate(template)"
              >
                <div class="template-card-content">
                  <div class="template-icon">
                    <v-icon size="large" color="primary">
                      mdi-clipboard-text-outline
                    </v-icon>
                  </div>
                  <div class="template-info">
                    <h4 class="text-subtitle-1 font-weight-medium">
                      {{ template.title }}
                    </h4>
                    <p
                      class="text-body-2 text-medium-emphasis template-description"
                    >
                      {{ template.description || "No description provided" }}
                    </p>
                  </div>
                  <div class="template-actions">
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      color="grey"
                      size="small"
                      class="delete-btn"
                      @click.stop="promptDelete(template)"
                    />
                    <v-btn
                      color="primary"
                      variant="tonal"
                      size="small"
                      :icon="
                        selectedTemplateId === template.id
                          ? 'mdi-check'
                          : 'mdi-arrow-right'
                      "
                      :class="{
                        'selected-btn': selectedTemplateId === template.id,
                      }"
                    />
                  </div>
                </div>
              </v-card>
            </div>

            <div class="template-selection-actions">
              <v-btn
                color="primary"
                :disabled="!selectedTemplateId"
                block
                size="large"
                @click="assignFromTemplate"
              >
                Continue with Selected Template
              </v-btn>
              <v-btn
                variant="text"
                color="grey"
                class="mt-2"
                block
                @click="showTemplateSelection = false"
              >
                Cancel
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">
            mdi-alert-circle
          </v-icon>
          Delete Template?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ templateToDelete?.title }}"?
          <div class="text-caption text-medium-emphasis mt-2">
            This action cannot be undone.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete"
            @click="deleteTemplate"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<style scoped>
.assign-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.option-card {
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.option-icon {
  margin-bottom: 16px;
  color: inherit;
}

.scratch-card:hover {
  border-color: rgb(25, 118, 210);
}

.template-selection-container {
  padding: 16px 0;
}

.empty-templates {
  text-align: center;
  padding: 40px 0;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.template-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 16px;
  max-height: 400px;
}

.template-card {
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border-radius: 12px;
  cursor: pointer;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.template-card.selected-template {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.template-card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.template-icon {
  flex-shrink: 0;
  background-color: rgba(var(--v-theme-primary), 0.1);
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-info {
  flex-grow: 1;
  min-width: 0;
}

.template-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.delete-btn {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.template-card:hover .delete-btn {
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1 !important;
  color: rgb(var(--v-theme-error)) !important;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.selected-btn {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.template-selection-actions {
  flex-shrink: 0;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .assign-options {
    grid-template-columns: 1fr;
  }
}
</style>
