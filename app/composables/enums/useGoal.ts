import { Goal } from "~/types/goal";
import { useEnumHelper } from "./useEnumHelpers";

export function useGoal() {
  const { getLabel, getOptions } = useEnumHelper<Goal>({
    [Goal.None]: "No specific goal",
    [Goal.WeightLoss]: "Weight loss",
    [Goal.MuscleGain]: "Muscle gain",
    [Goal.EnduranceImprovement]: "Endurance improvement",
    [Goal.CompetitionPreparation]: "Competition preparation",
    [Goal.GettingBackInShape]: "Getting back in shape",
    [Goal.PhysicalConditionMaintenance]: "Physical condition maintenance",
  });

  return {
    getGoalLabel: getLabel,
    getGoalOptions: getOptions,
  };
}
