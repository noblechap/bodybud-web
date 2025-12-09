import type { StepData, StepGoal } from "~/types/client";

export function useStepsApi() {
  const { $authenticatedApi } = useNuxtApp();

  async function fetchStepGoal(clientId: number) {
    return $authenticatedApi<StepGoal>(`/users/${clientId}/step-goal/`);
  }

  async function updateStepGoal(clientId: number, stepGoalId: number, stepGoal: number) {
    return $authenticatedApi<StepGoal>(`/users/${clientId}/step-goal/${stepGoalId}/`, {
      method: "PATCH",
      body: { step_goal: stepGoal },
    });
  }

  async function fetchActivitySummaries(clientId: number) {
    return $authenticatedApi<StepData[]>(`/users/${clientId}/activity-summary/`);
  }

  return {
    fetchStepGoal,
    updateStepGoal,
    fetchActivitySummaries,
  };
}
