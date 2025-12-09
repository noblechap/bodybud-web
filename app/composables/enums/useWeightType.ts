import { WeightType } from "~/types/weightType";
import { useEnumHelper } from "./useEnumHelpers";

export function useWeightType() {
  const { getLabel, getOptions } = useEnumHelper<WeightType>({
    [WeightType.Dumbbell]: "Dumbbell",
    [WeightType.Barbell]: "Barbell",
    [WeightType.MachinePin]: "Machine Pin",
    [WeightType.MachinePlate]: "Machine Plate",
    [WeightType.Other]: "Other",
  });

  return {
    getWeightTypeLabel: getLabel,
    getWeightTypeOptions: getOptions,
  };
}
