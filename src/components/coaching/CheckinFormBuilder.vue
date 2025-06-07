<template>
  <div class="checkin-builder">
    <!-- Header Section -->
    <div class="header">
      <div class="header-title">
        <v-icon size="28" color="primary">mdi-clipboard-pulse</v-icon>
        <h1 class="text-h5">Create Client Check-In</h1>
      </div>
      <div class="header-actions">
        <v-btn
          variant="text"
          :color="completionPercentage < 100 ? 'grey' : 'primary'"
          :disabled="completionPercentage < 100"
          @click="confirmSaveTemplate"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-send"
          :disabled="completionPercentage < 100"
          @click="assignCheckIn"
        >
          Assign Check-In
        </v-btn>
      </div>
    </div>

    <!-- Progress Indicator -->
    <v-progress-linear
      :model-value="completionPercentage"
      color="primary"
      height="4"
      class="progress-bar"
    ></v-progress-linear>

    <!-- Main Content Area -->
    <div class="builder-layout">
      <!-- Left Panel - Form Configuration -->
      <div class="config-panel">
        <v-card variant="flat" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2"
              >mdi-information-outline</v-icon
            >
            Basic Information
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="formData.title"
              label="Check-In Title"
              variant="outlined"
              placeholder="Weekly Progress Review"
              prepend-inner-icon="mdi-format-title"
              class="mb-4"
              :rules="[(v) => !!v || 'Title is required']"
              counter="100"
              maxlength="100"
            ></v-text-field>

            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="formattedDueDate"
                  label="Due Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="formData.dueDate"
                @update:model-value="dateMenu = false"
                :min="minDate"
              ></v-date-picker>
            </v-menu>

            <v-textarea
              v-model="formData.description"
              label="Instructions for Client"
              variant="outlined"
              rows="4"
              placeholder="Add any context or detailed instructions..."
              prepend-inner-icon="mdi-text-box-outline"
              counter="300"
              maxlength="300"
            ></v-textarea>
          </v-card-text>
        </v-card>

        <v-card variant="flat" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-plus-circle</v-icon>
            Add Questions
          </v-card-title>
          <v-card-text>
            <div class="question-types">
              <v-btn
                @click="addItem('PHOTO')"
                class="question-type-btn"
                color="blue-darken-2"
                variant="elevated"
              >
                <v-icon start>mdi-camera</v-icon>
                <span>Photo</span>
              </v-btn>
              <v-btn
                @click="addItem('VIDEO')"
                class="question-type-btn"
                color="red-darken-2"
                variant="elevated"
              >
                <v-icon start>mdi-video</v-icon>
                <span>Video</span>
              </v-btn>
              <v-btn
                @click="addItem('TEXT')"
                class="question-type-btn"
                color="purple-darken-2"
                variant="elevated"
              >
                <v-icon start>mdi-text-box-outline</v-icon>
                <span>Text</span>
              </v-btn>
              <v-btn
                @click="addItem('NUMBER')"
                class="question-type-btn"
                color="orange-darken-2"
                variant="elevated"
              >
                <v-icon start>mdi-numeric</v-icon>
                <span>Number</span>
              </v-btn>
              <v-btn
                @click="addItem('YES_NO')"
                class="question-type-btn"
                color="rgb(30, 150, 50)"
                variant="elevated"
              >
                <v-icon start>mdi-check-circle-outline</v-icon>
                <span>Yes/No</span>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card variant="flat" v-if="formData.items.length > 0">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-chart-box</v-icon>
            Check-In Summary
          </v-card-title>
          <v-card-text>
            <div class="visual-summary">
              <div class="summary-icons">
                <div
                  v-for="(type, index) in uniqueTypes"
                  :key="index"
                  class="summary-icon"
                  :style="{ backgroundColor: getColorForType(type) }"
                >
                  <v-icon color="white">{{ getItemTypeIcon(type) }}</v-icon>
                  <div class="icon-count">{{ getTypeCount(type) }}</div>
                </div>
              </div>
              <div class="summary-chart">
                <div
                  v-for="(type, index) in uniqueTypes"
                  :key="index"
                  class="chart-bar"
                  :style="{
                    width: `${(getTypeCount(type) / formData.items.length) * 100}%`,
                    backgroundColor: getColorForType(type),
                  }"
                ></div>
              </div>
              <div class="summary-stats">
                <div class="stat-item">
                  <v-icon color="primary">mdi-format-list-checks</v-icon>
                  <span>{{ formData.items.length }} total</span>
                </div>
                <div class="stat-item">
                  <v-icon color="red">mdi-flag</v-icon>
                  <span>{{ requiredItemsCount }} required</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Right Panel - Item Builder -->
      <div class="builder-panel">
        <div class="questions-editor-card">
          <div class="panel-header">
            <h2>
              <v-icon class="mr-2">mdi-format-list-bulleted-square</v-icon>
              Items
              <v-chip
                size="small"
                color="primary"
                variant="tonal"
                class="ml-3 item-count-chip"
              >
                {{ formData.items.length }}
              </v-chip>
            </h2>
            <v-btn
              v-if="formData.items.length > 0"
              variant="text"
              color="primary"
              size="small"
              @click="showPreview = true"
              prepend-icon="mdi-eye"
            >
              Preview
            </v-btn>
          </div>

          <div class="questions-content-area">
            <draggable
              v-if="formData.items.length > 0"
              v-model="formData.items"
              item-key="id"
              handle=".drag-handle"
              class="questions-container"
            >
              <template #item="{ element, index }">
                <div class="checkin-item">
                  <div
                    class="item-header"
                    :style="{ backgroundColor: getColorForType(element.type) }"
                  >
                    <div class="item-type">
                      <v-icon size="18" color="white">{{
                        getItemTypeIcon(element.type)
                      }}</v-icon>
                      <span class="text-white">{{
                        getItemTypeLabel(element.type)
                      }}</span>
                      <v-chip
                        v-if="element.isRequired"
                        size="x-small"
                        variant="outlined"
                        color="white"
                        class="ml-2 required-chip"
                        label
                        density="compact"
                      >
                        Required
                      </v-chip>
                    </div>
                    <div class="item-actions">
                      <v-icon
                        icon="mdi-drag"
                        size="18"
                        color="white"
                        class="drag-handle"
                      ></v-icon>
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="white"
                        @click="removeItem(index)"
                      ></v-btn>
                    </div>
                  </div>

                  <v-text-field
                    v-model="element.prompt"
                    :placeholder="getPlaceholder(element.type)"
                    variant="outlined"
                    class="mt-3 mx-4"
                    hide-details="auto"
                    counter
                    maxlength="200"
                  ></v-text-field>

                  <div class="item-options">
                    <v-switch
                      v-model="element.isRequired"
                      color="primary"
                      label="Required"
                      hide-details
                      density="comfortable"
                      inset
                    ></v-switch>
                  </div>
                </div>
              </template>
            </draggable>

            <div v-if="formData.items.length === 0" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="64" color="grey"> mdi-clipboard </v-icon>
              </div>
              <h3 class="text-h6 mb-2">Build Your Check-In</h3>
              <p class="text-body-1 text-medium-emphasis mb-6">
                Add questions to gather insights from your client.
              </p>
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-plus"
                @click="addItem('TEXT')"
                variant="elevated"
              >
                Add First Question
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clean Preview Dialog -->
    <v-dialog v-model="showPreview" max-width="600">
      <v-card>
        <v-card-title class="preview-header">
          <v-icon color="primary" class="mr-2">mdi-eye-outline</v-icon>
          Check-In Preview
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showPreview = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="preview-content">
          <div class="preview-title">
            <h3>{{ formData.title || "Untitled Check-In" }}</h3>
            <v-chip
              v-if="formattedDueDate"
              color="grey-darken-2"
              prepend-icon="mdi-calendar"
            >
              Due: {{ formattedDueDate }}
            </v-chip>
          </div>

          <p class="preview-description">
            {{ formData.description || "No description provided." }}
          </p>

          <div class="preview-items" v-if="formData.items.length > 0">
            <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="preview-item"
            >
              <div class="preview-item-header">
                <div
                  class="preview-item-type"
                  :style="{ color: getColorForType(item.type) }"
                >
                  <v-icon :color="getColorForType(item.type)" size="small">
                    {{ getItemTypeIcon(item.type) }}
                  </v-icon>
                  <span>{{ getItemTypeLabel(item.type) }}</span>
                  <v-chip
                    v-if="item.isRequired"
                    size="x-small"
                    color="red"
                    variant="tonal"
                    class="ml-2"
                  >
                    Required
                  </v-chip>
                </div>
                <div class="preview-item-number">{{ index + 1 }}</div>
              </div>
              <div class="preview-item-prompt">{{ item.prompt }}</div>
            </div>
          </div>
          <div v-else class="preview-empty">
            <v-icon size="large" color="grey">mdi-flask-empty-outline</v-icon>
            <p>No questions in this check-in yet.</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Save Template Confirmation Dialog -->
    <v-dialog v-model="showSaveTemplateDialog" max-width="500">
      <v-card class="pa-2">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-content-save</v-icon>
          Save Check-In Template
        </v-card-title>

        <v-card-text>
          <p>This will save the current check-in as a template.</p>
          <p class="text-medium-emphasis mt-2">
            You'll be able to quickly assign this same check-in format to
            clients in the future.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showSaveTemplateDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveCheckInTemplate"
            prepend-icon="mdi-content-save"
          >
            Save Template
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import draggable from "vuedraggable";
import { useClientStore } from "../../stores/clientStore";
import { useCoachStore } from "../../stores/coachStore";
import { useToast } from "vue-toastification";

const dateMenu = ref(false);
const showPreview = ref(false);
const clientStore = useClientStore();
const coachStore = useCoachStore();
const toast = useToast();
const showSaveTemplateDialog = ref(false);

const emit = defineEmits(["close"]);

const props = defineProps({
  template: {
    type: Object,
    required: false,
    default: null,
  },
});

const formData = ref({
  title: "",
  dueDate: new Date(),
  description: "",
  items: [],
});

onMounted(() => {
  if (props.template) {
    formData.value.title = props.template.title || "";
    formData.value.description = props.template.description || "";
    formData.value.dueDate = new Date();

    formData.value.items = (props.template.items || []).map((item) => ({
      type: item.item_type,
      prompt: item.prompt || "",
      isRequired: item.is_required ?? true,
    }));
  }
});

const availableTypes = ref([
  { label: "Picture Submission", value: "PHOTO" },
  { label: "Video Submission", value: "VIDEO" },
  { label: "Text Response", value: "TEXT" },
  { label: "Number Input", value: "NUMBER" },
  { label: "Yes/No Question", value: "YES_NO" },
]);

const formattedDueDate = computed(() => {
  if (!formData.value.dueDate) return "";
  const date = new Date(formData.value.dueDate);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const minDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const requiredItemsCount = computed(() => {
  return formData.value.items.filter((item) => item.isRequired).length;
});

const uniqueTypes = computed(() => {
  return [...new Set(formData.value.items.map((item) => item.type))];
});

const completionPercentage = computed(() => {
  let score = 0;
  if (formData.value.title && formData.value.title.trim() !== "") score += 30;
  if (formData.value.description && formData.value.description.trim() !== "")
    score += 20;
  if (formData.value.items.length > 0) {
    score += 30;
    if (
      formData.value.items.every(
        (item) => item.prompt && item.prompt.trim() !== "",
      )
    )
      score += 20;
  }
  return Math.min(score, 100);
});

function addItem(type) {
  formData.value.items.push({
    type,
    prompt: "",
    isRequired: true,
  });
}

function removeItem(index) {
  formData.value.items.splice(index, 1);
}

function getItemTypeLabel(type) {
  const item = availableTypes.value.find((item) => item.value === type);
  return item ? item.label : type;
}

function getItemTypeIcon(type) {
  const icons = {
    PHOTO: "mdi-camera",
    VIDEO: "mdi-video",
    TEXT: "mdi-text-box-outline",
    NUMBER: "mdi-numeric",
    YES_NO: "mdi-check-circle-outline",
  };
  return icons[type] || "mdi-help-circle-outline";
}

function getPlaceholder(type) {
  const placeholders = {
    PHOTO: "Request physique photo (e.g. 'Front relaxed pose')",
    VIDEO: "Request a video (e.g. 'Posing routine', 'Squat 3 reps')",
    TEXT: "Ask a question that requires a text response...",
    NUMBER: "Ask for a numeric value (e.g. 'Current bodyweight (lb)')...",
    YES_NO: "Ask a yes/no question (e.g. 'Did you hit your macros today?')...",
  };
  return placeholders[type] || "Enter your question...";
}

function getColorForType(type) {
  const colors = {
    PHOTO: "rgb(25, 118, 210)", // Vuetify blue-darken-2
    VIDEO: "rgb(211, 47, 47)", // Vuetify red-darken-2
    TEXT: "rgb(81, 45, 168)", // Vuetify purple-darken-2
    NUMBER: "rgb(245, 124, 0)", // Vuetify orange-darken-2
    YES_NO: "rgb(30, 150, 50)",
  };
  return colors[type] || "rgb(96, 125, 139)"; // Default blue-grey
}

function getTypeCount(type) {
  return formData.value.items.filter((item) => item.type === type).length;
}

const confirmSaveTemplate = () => {
  showSaveTemplateDialog.value = true;
};

const assignCheckIn = async () => {
  try {
    if (!formData.value.title) {
      toast.error("Please provide a title for the check-in");
      return;
    }
    if (formData.value.items.length === 0) {
      toast.error("Please add at least one question to the check-in");
      return;
    }

    const hasEmptyPrompts = formData.value.items.some(
      (item) => !item.prompt || item.prompt.trim() === "",
    );

    if (hasEmptyPrompts) {
      toast.error("Please ensure all questions have text");
      return;
    }

    const payload = {
      client: clientStore.clientId,
      due_date: formData.value.dueDate,
      title: formData.value.title,
      description: formData.value.description,
      items: formData.value.items.map((item, index) => ({
        item_type: item.type,
        prompt: item.prompt,
        is_required: item.isRequired,
        order: index + 1,
      })),
    };

    await clientStore.assignCheckIn(payload);

    toast.success("Check-in assigned successfully!");
    emit("close");
  } catch (error) {
    console.error("Error assigning check-in:", error);
    toast.error("Failed to assign check-in. Please try again.");
  }
};

const saveCheckInTemplate = async () => {
  showSaveTemplateDialog.value = false;
  try {
    if (!formData.value.title) {
      toast.error("Please provide a title for the check-in");
      return;
    }
    if (formData.value.items.length === 0) {
      toast.error("Please add at least one question to the check-in");
      return;
    }

    const hasEmptyPrompts = formData.value.items.some(
      (item) => !item.prompt || item.prompt.trim() === "",
    );

    if (hasEmptyPrompts) {
      toast.error("Please ensure all questions have text");
      return;
    }

    const payload = {
      title: formData.value.title,
      description: formData.value.description,
      items: formData.value.items.map((item, index) => ({
        item_type: item.type,
        prompt: item.prompt,
        is_required: item.isRequired,
        order: index + 1,
      })),
    };

    await coachStore.saveCheckInTemplate(payload);

    toast.success("Check-in template saved successfully!");
  } catch (error) {
    console.error("Error saving check-in:", error);
    toast.error("Failed to save check-in. Please try again.");
  }
};
</script>

<style scoped>
.checkin-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background-color: #f5f7fa; /* Overall page background */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h1 {
  margin: 0;
  font-weight: 500;
}

.progress-bar {
  margin: 0;
  flex-shrink: 0;
}

.builder-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.config-panel {
  flex: 0 0 380px;
  padding: 24px; /* Consistent padding */
  overflow-y: auto;
  background-color: white; /* Config panel is a white card */
  border-right: 1px solid #e0e0e0;
}

.builder-panel {
  flex: 1;
  padding: 24px; /* Outer padding for the questions editor card */
  overflow-y: auto;
  background-color: #f5f7fa; /* Light background for contrast */
}

.questions-editor-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensures border-radius clips content */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8edf2; /* Softer border */
  flex-shrink: 0;
}

.panel-header h2 {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.2rem; /* Slightly smaller H2 */
  font-weight: 600; /* Bolder header */
}

.item-count-chip {
  font-weight: 500;
}

.questions-content-area {
  padding: 24px;
  /* flex-grow: 1; Let content define height, builder-panel handles scroll */
}

.question-types {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(110px, 1fr)
  ); /* Slightly smaller min for 3 per row */
  gap: 12px;
}

.question-type-btn {
  height: 48px;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
}

.visual-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  color: white;
}

.icon-count {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: white;
  color: #333;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  border: 2px solid #f5f7fa;
}

.summary-chart {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.chart-bar {
  height: 100%;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #616161;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkin-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06); /* Subtle shadow for items */
  border: 1px solid #e8edf2; /* Light border for items */
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: white;
}

.item-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.required-chip {
  font-weight: 500;
  height: 20px !important;
  border-color: rgba(255, 255, 255, 0.7) !important;
}
.required-chip .v-chip__underlay {
  background-color: transparent !important;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
  padding: 30px 0; /* Padding within the content area */
}

.empty-illustration {
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-state h3 {
  font-weight: 600;
  color: #333;
}

.empty-state p {
  color: #555;
}

/* Preview Dialog Styles */
.preview-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: #fafafa;
}

.preview-content {
  padding: 24px;
  background-color: #f9f9f9;
}

.preview-title {
  margin-bottom: 16px;
}

.preview-title h3 {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 600;
}

.preview-description {
  margin: 0 0 24px;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.preview-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-item-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-item-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #eeeeee;
  color: #424242;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-item-prompt {
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.5;
  color: #333;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9e9e9e;
}

.preview-empty p {
  margin-top: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .builder-layout {
    flex-direction: column;
  }

  .config-panel {
    flex: none;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    max-height: 50vh;
    padding: 16px; /* Adjust padding for smaller screens */
  }
  .builder-panel {
    padding: 16px; /* Adjust padding for smaller screens */
  }
  .questions-editor-card {
    margin: 0; /* Full width on smaller screens */
  }
  .panel-header {
    padding: 16px;
  }
  .questions-content-area {
    padding: 16px;
  }
  .question-types {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

.checkin-item .v-text-field {
  margin-bottom: 12px;
}
.checkin-item .v-input--density-comfortable {
  --v-input-control-height: 48px;
}

.drag-handle {
  cursor: move;
  color: white;
}

.header-actions {
  display: flex;
  gap: 12px;
}
</style>
