import type {
  CreateWorkoutCategoryPayload,
  CreateWorkoutTemplatePayload,
  UpdateWorkoutTemplatePayload,
} from "~/composables/api/coaching/useWorkoutTemplateApi";
import { useWorkoutTemplateApi } from "~/composables/api/coaching/useWorkoutTemplateApi";
import { useClientApi } from "~/composables/api/coaching/useClientApi";
import { useClientStore } from "~/store/clientStore";

export function useWorkoutTemplateService() {
  const workoutTemplateApi = useWorkoutTemplateApi();
  const clientApi = useClientApi();
  const clientStore = useClientStore();
  const toast = useToast();
  const { showLoading, hideLoading } = useGlobalLoading();

  async function createCategory(payload: CreateWorkoutCategoryPayload) {
    if (!clientStore.clientId) {
      toast.error("No client selected");
      throw new Error("No client selected");
    }

    try {
      showLoading("Creating category...");
      const response = await workoutTemplateApi.createCategory(clientStore.clientId, payload);

      const newCategory: typeof clientStore.workout_templates[number] = {
        ...response,
        workouts: [],
      };
      clientStore.workout_templates.push(newCategory);

      toast.success(`Category "${payload.name}" created successfully!`);
      return response;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to create category";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function deleteCategory(categoryId: number) {
    if (!clientStore.clientId) {
      toast.error("No client selected");
      throw new Error("No client selected");
    }

    try {
      showLoading("Deleting category...");
      await workoutTemplateApi.deleteCategory(clientStore.clientId, categoryId);

      const categoryIndex = clientStore.workout_templates.findIndex(
        (category) => category.id === categoryId,
      );
      if (categoryIndex !== -1) {
        const category = clientStore.workout_templates[categoryIndex];
        if (category) {
          const categoryName = category.name;
          clientStore.workout_templates.splice(categoryIndex, 1);
          toast.success(`Category "${categoryName}" deleted successfully!`);
        }
      }
      await clientApi.signalChanges(clientStore.clientId);
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete category";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function createWorkoutTemplate(payload: CreateWorkoutTemplatePayload) {
    if (!clientStore.clientId) {
      toast.error("No client selected");
      throw new Error("No client selected");
    }

    try {
      showLoading("Creating workout template...");
      const response = await workoutTemplateApi.createWorkoutTemplate(clientStore.clientId, payload);
      await clientApi.signalChanges(clientStore.clientId);
      toast.success("Workout template created successfully!");
      return response;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to create workout template";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function updateWorkoutTemplate(workoutId: number, payload: UpdateWorkoutTemplatePayload) {
    if (!clientStore.clientId) {
      toast.error("No client selected");
      throw new Error("No client selected");
    }

    try {
      showLoading("Updating workout template...");
      const response = await workoutTemplateApi.updateWorkoutTemplate(
        clientStore.clientId,
        workoutId,
        payload,
      );

      await clientApi.signalChanges(clientStore.clientId);
      
      toast.success("Workout template updated successfully!");
      return response;
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to update workout template";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  async function deleteWorkoutTemplate(workoutId: number) {
    if (!clientStore.clientId) {
      toast.error("No client selected");
      throw new Error("No client selected");
    }

    try {
      showLoading("Deleting workout template...");
      await workoutTemplateApi.deleteWorkoutTemplate(clientStore.clientId, workoutId);

      clientStore.workout_templates.forEach((category) => {
        const workoutIndex = category.workouts.findIndex(
          (w) => w.id === workoutId,
        );
        if (workoutIndex !== -1) {
          category.workouts.splice(workoutIndex, 1);
        }
      });
      await clientApi.signalChanges(clientStore.clientId);
      toast.success("Workout template deleted successfully!");
    }
    catch (error) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || "Failed to delete workout template";
      toast.error(errorMsg);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  return {
    createCategory,
    deleteCategory,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
  };
}
