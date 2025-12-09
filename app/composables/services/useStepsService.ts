import { useStepsApi } from "~/composables/api/steps/useStepsApi";
import { useClientStore } from "~/store/clientStore";

export function useStepsService() {
  const stepsApi = useStepsApi();
  const clientStore = useClientStore();
  const toast = useToast();

  async function loadSteps(): Promise<void> {
    if (!clientStore.clientId) {
      throw new Error("No client selected");
    }

    try {
      const [stepGoalResult, activitySummaries] = await Promise.allSettled([
        stepsApi.fetchStepGoal(clientStore.clientId),
        stepsApi.fetchActivitySummaries(clientStore.clientId),
      ]);

      // Handle step goal (may not exist yet, silent fail)
      if (stepGoalResult.status === "fulfilled") {
        clientStore.setStepGoal(stepGoalResult.value);
      }
      else {
        // Set default step goal if not found
        clientStore.setStepGoal({ id: 0, step_goal: 10000, created_at: "", updated_at: "" });
      }

      // Handle activity summaries
      if (activitySummaries.status === "fulfilled") {
        clientStore.setSteps(activitySummaries.value);
      }
      else {
        clientStore.setSteps([]);
      }
    }
    catch {
      // Silent fail - just set empty data
      clientStore.setStepGoal({ id: 0, step_goal: 10000, created_at: "", updated_at: "" });
      clientStore.setSteps([]);
    }
  }

  async function updateStepGoal(stepGoal: number): Promise<void> {
    if (!clientStore.clientId || !clientStore.stepGoal.id) {
      throw new Error("No client or step goal selected");
    }

    try {
      const updatedGoal = await stepsApi.updateStepGoal(
        clientStore.clientId,
        clientStore.stepGoal.id,
        stepGoal,
      );
      clientStore.setStepGoal(updatedGoal);
      toast.success("Step goal updated successfully!");
    }
    catch (error) {
      toast.error("Failed to update step goal");
      throw error;
    }
  }

  return {
    loadSteps,
    updateStepGoal,
  };
}
